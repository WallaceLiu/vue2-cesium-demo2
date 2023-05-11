const path = require('path')

const resolve = dir => path.join(__dirname, dir)

const BASE_URL = process.env.NODE_ENV === 'production' ? './' : '/'

const webpack = require('webpack')

module.exports = {
    // UI界面上设置的，取消我们每次保存都进行检测
    
    lintOnSave: false,
    publicPath: "./" ,
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src'))
            // 用公共的组件用定义好的即可‘_c’
            .set('_c', resolve('src/components'))
    },
    // 打包时不生成.map文件
    productionSourceMap: false,
    devServer: {
        // host: '0.0.0.0',
        public: '0.0.0.0:5277',
        port: 5277,
        proxy: null
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "windows.jQuery": "jquery"
            })
        ]
    }
}