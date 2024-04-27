const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', // Set to 'production' for optimized builds
    entry: './src/index.ts', // Your main TypeScript file
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // Output folder
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,  // Target TypeScript files
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({  
            template: './index.html', // Path to your root index.html
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist') 
        },
        port: 8080, // Or any other available port
        open: false, // Disable Webpack's own open behavior
        hot: true // Enable hot module replacement
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'], // Order to resolve files
    },
};
