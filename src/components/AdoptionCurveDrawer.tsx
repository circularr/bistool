import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AdoptionCurveDrawerProps {
  onChange: (params: { a: number; b: number }) => void;
  initialA: number;
  initialB: number;
  N: number;
  T: number;
}

const AdoptionCurveDrawer: React.FC<AdoptionCurveDrawerProps> = ({ onChange, initialA, initialB, N, T }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [aInput, setAInput] = useState(initialA.toFixed(2));
  const [bInput, setBInput] = useState(initialB.toFixed(2));
  const [isDragging, setIsDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState<'start' | 'inflection' | 'saturation' | null>(null);

  const formatValue = useCallback((value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  }, []);

  const formatXAxis = useCallback((value: number) => {
    if (T > 60) {
      return `${(value / 12).toFixed(0)}Y`;
    }
    return value.toString();
  }, [T]);

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += height / 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.moveTo(0, height);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Label axes
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(`Time (0 to ${formatXAxis(T)} ${T > 60 ? 'years' : 'months'})`, width / 2, height - 5);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Users (0 to ${formatValue(N)})`, -height / 2, 15);
    ctx.restore();

    // Draw S-curve
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x++) {
      const t = (x / width) * T;
      const y = height - (height * (1 / (1 + Math.exp(-a * (t - b)))));
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Draw control points
    const controlPoints = [
      { x: 0, y: height },
      { x: b * (width / T), y: height / 2 },
      { x: width, y: height * 0.1 }
    ];

    controlPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = dragPoint === ['start', 'inflection', 'saturation'][index] ? 'red' : 'blue';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText(['Start', 'Inflection', 'Saturation'][index], point.x + 5, point.y - 5);
    });
  }, [a, b, N, T, formatXAxis, formatValue, dragPoint]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetWidth * 0.5; // Maintain a 2:1 aspect ratio
        drawCurve();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawCurve]);

  const updateCurve = (newA: number, newB: number) => {
    setA(newA);
    setB(newB);
    setAInput(newA.toFixed(2));
    setBInput(newB.toFixed(2));
    onChange({ a: newA, b: newB });
    drawCurve();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const controlPoints = [
      { x: 0, y: canvas.height },
      { x: b * (canvas.width / T), y: canvas.height / 2 },
      { x: canvas.width, y: canvas.height * 0.1 }
    ];

    const clickedPoint = controlPoints.findIndex(point => 
      Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)) < 10
    );

    if (clickedPoint !== -1) {
      setIsDragging(true);
      setDragPoint(['start', 'inflection', 'saturation'][clickedPoint] as 'start' | 'inflection' | 'saturation');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragPoint === 'inflection') {
      const newB = (x / canvas.width) * T;
      const newA = -Math.log((canvas.height / y) - 1) / (newB - T/2);
      updateCurve(newA, newB);
    } else if (dragPoint === 'saturation') {
      const newA = -Math.log((canvas.height / y) - 1) / (T - b);
      updateCurve(newA, b);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPoint(null);
  };

  const handleManualInput = (param: 'a' | 'b', value: string) => {
    if (param === 'a') {
      setAInput(value);
    } else {
      setBInput(value);
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (param === 'a') {
        updateCurve(numValue, b);
      } else {
        updateCurve(a, numValue);
      }
    }
  };

  return (
    <div className="mt-8 bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Adoption Curve Profile</h3>
      <p className="text-sm text-gray-600 mb-4">
        Drag the inflection and saturation points to adjust the curve, or use the inputs below.
      </p>
      <div className="w-full" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full border border-gray-200 rounded-lg shadow-inner cursor-pointer mb-4"
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">
        The Adoption Curve shows how a product gains users over time, typically following an S-shape, with the inflection point being the moment when adoption growth is fastest and the curve changes from concave to convex.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adoption Rate (a)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={aInput}
              onChange={(e) => handleManualInput('a', e.target.value)}
              onBlur={() => setAInput(a.toFixed(2))}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-800"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                rate
              </span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inflection Point (b)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={bInput}
              onChange={(e) => handleManualInput('b', e.target.value)}
              onBlur={() => setBInput(b.toFixed(2))}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-800"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                months
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionCurveDrawer;