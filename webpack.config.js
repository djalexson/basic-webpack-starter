const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const {extendDefaultPlugins} = require("svgo");
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
const stylesHandler = isProd ? MiniCssExtractPlugin.loader : 'style-loader';

const optimization = () => {
  const configObj = {
    splitChunks: {
      chunks: 'all'
    }
  };

  if (isProd) {
    configObj.minimizer = [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin()
    ];
  }

  return configObj;
};


const config = {
  context:  path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: './js/main.ts',
  output: {
  filename: `./js/${filename('js')}`,
   path: path.resolve(__dirname, 'dist'),  
   assetModuleFilename: './img/[name][ext][query]',
   publicPath: ""
},  
devServer: {
  historyApiFallback: true,
  static: {
    directory: path.join(__dirname, 'dist'),
    watch: true,
  },

  open: true,
  compress: true,
  hot: true,
  port: 3000,
},


plugins: [
  
  new HTMLWebpackPlugin({
    template: path.resolve(__dirname, 'src/index.html'),
    filename: 'index.html',
    minify: {
      collapseWhitespace: isProd
    }
  }),
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: `./css/${filename('css')}`
  }),
  new CopyWebpackPlugin({
    patterns: [
      {from: path.resolve(__dirname, 'src/assets') , to: path.resolve(__dirname, 'dist')}
    ]
  }),

],
optimization: optimization(),

devtool: isProd ? false : 'source-map',

module: {
  rules: [
    {
      test: /\.(ts|tsx)$/i,
      loader: 'ts-loader',
      exclude: ['/node_modules/'],
  },
    {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
      type: 'asset/resource'
   },
   {
     test: /\.html$/,
     loader: 'html-loader',
    },
    {
      test: /\.css$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
          hmr: isDev
        },
        },
        'css-loader'
      ],
    },
    {
      test: /\.s[ac]ss$/,
      use: [
        {
          loader:  MiniCssExtractPlugin.loader,
          options: {
            publicPath: (resourcePath, context) => {
              return path.relative(path.dirname(resourcePath), context) + '/';
            },
          }
        },
        'css-loader',
        'sass-loader'
      ],
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    },
    //{
    //  test: /\.(?:|gif|png|jpg|jpeg|svg)$/,
    //  use: [{
    // loader:  'url-loader',    
    //    options: {
    //      limit: 8000,
  
    //      name: "./img/[name].[ext]",
    //      publicPath: 'assets'
    //      //${filename('[ext]')}`
    //    }
    //  },
      
    //],
    //},
    {
 
      test: /\.(?:|woff2)$/,
  
    generator: {
              filename:  `./fonts/[name].[ext]`
            },
      use: [{
       
        loader: 'file-loader',
        //options: {
        //  name: `./fonts/${filename('[ext]')}`
        //}
      }],
    }
  ]
},

optimization: {
  minimizer: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          // Lossless optimization with custom option
          // Feel free to experiment with options for better result for you
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],        
              
            ],
          
        },
      },
    }),
  ],
},
resolve: {
  extensions: ['.tsx', '.ts', '.js'],
},


}


module.exports = () => {
  if (isProd) {
      config.mode = 'production';
      
      config.plugins.push(new MiniCssExtractPlugin());
      
      
  } else {
      config.mode = 'development';
  }
  return config;
};
