const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
	entry: "./reader.js",
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [ MiniCssExtractPlugin.loader, "css-loader" ],
			}
		]
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].[contenthash].js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./index.html"
		}),
		new MiniCssExtractPlugin({
			filename: "[name].[contenthash].css"
		}),
	],
	mode: "development"
}