# Business Model Comparison Tool

This project is an interactive web application for comparing Free Trial and Freemium business models. It provides a sophisticated economic analysis based on various parameters such as Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), discount rates, and network effects.

## Features

- Interactive input form for model parameters
- Real-time calculation of Net Present Value (NPV) for both models
- Break-even analysis
- Adoption curve visualization and customization
- Responsive design for mobile and desktop
- Multiple display modes: Interactive Model, Academic Paper, Magazine Article, and Simple Explanation

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- React-Tooltip
- Recharts for data visualization
- Jest for testing

## Getting Started

To run this project locally:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/business-model-comparison.git
   ```

2. Navigate to the project directory:
   ```
   cd business-model-comparison
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Testing

To run the tests:

```
npm test
```

The tests are located in `src/utils/calculations.test.ts` and cover various scenarios for both the Free Trial and Freemium models.

## Model Details

The economic model used in this tool is based on advanced concepts including:

- S-curve adoption for the Freemium model
- Time value of money (discount rates)
- Customer Acquisition Costs (CAC)
- Customer Lifetime Value (CLV)
- Network effects

For a detailed explanation of the model

## Deployment

This project is optimized for deployment on Vercel. Follow the standard Vercel deployment process for Next.js applications.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
