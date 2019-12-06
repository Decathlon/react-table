const path = require("path");

const ROOT_DIRECTORY = path.join(__dirname, "..");
const APP_DIRECTORY = path.join(ROOT_DIRECTORY, "src");

module.exports = {
  resolve: {
    // Add the app directory to use absolute imports
    modules: [APP_DIRECTORY, "node_modules"],
    extensions: [".js", ".tsx", ".ts", ".md"]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["react-app", { flow: false, typescript: true }]]
            }
          },
          {
            loader: "react-docgen-typescript-loader"
          }
        ]
      },
      {
        test: /\.stories\.tsx?$/,
        loaders: [
          {
            loader: require.resolve("@storybook/source-loader"),
            options: { parser: "typescript" }
          }
        ],
        enforce: "pre"
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "markdown-loader"
          }
        ]
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
        include: path.resolve(__dirname, "../")
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        use: "url-loader?limit=100000&name=[name].[ext]"
      }
    ]
  }
};
