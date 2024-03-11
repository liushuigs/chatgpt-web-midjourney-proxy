module.exports = (req, res) => {
  console.log('session.js', req.body)
  try {
    const data = req.body.data
    const obj = {
      status: 'Success',
      message: '',
      data: {
        isHideServer: false,
        isUpload: false,
        auth: !!process.env.AUTH_SECRET_KEY,
        model: 'ChatGPTAPI',
        amodel: process.env.OPENAI_API_MODEL ?? 'gpt-3.5-turbo',
        isApiGallery: !!process.env.MJ_API_GALLERY,
        cmodels: process.env.CUSTOM_MODELS ?? '',
        baiduId: process.env.TJ_BAIDU_ID ?? '',
        googleId: process.env.TJ_GOOGLE_ID ?? '',
        notify: process.env.SYS_NOTIFY ?? '',
        disableGpt4: process.env.DISABLE_GPT4 ?? '',
        isWsrv: process.env.MJ_IMG_WSRV ?? '',
        uploadImgSize: process.env.UPLOAD_IMG_SIZE ?? '1',
        gptUrl: process.env.GPT_URL ?? '',
        theme: process.env.SYS_THEME ?? 'dark',
        isCloseMdPreview: !!process.env.CLOSE_MD_PREVIEW,

      },
    }
    res.writeHead(200).end(
      JSON.stringify(obj),
    )
  }
  catch (e) {
    console.error('session.js', e, req.body)
  }
}
