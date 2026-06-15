export default defineAppConfig({
  pages: [
    'pages/footEntry/index',
    'pages/lastFit/index',
    'pages/grading/index',
    'pages/archive/index',
    'pages/library/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#8B5E3C',
    navigationBarTitleText: '楦型配码系统',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9C8B7A',
    selectedColor: '#8B5E3C',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/footEntry/index',
        text: '脚型录入'
      },
      {
        pagePath: 'pages/lastFit/index',
        text: '楦型适配'
      },
      {
        pagePath: 'pages/grading/index',
        text: '版型推档'
      },
      {
        pagePath: 'pages/archive/index',
        text: '定制档案'
      },
      {
        pagePath: 'pages/library/index',
        text: '版型库'
      }
    ]
  }
})
