const extension = require('extensionizer')

class ExtensionPlatform {

  //
  // Public
  //
  reload () {
    extension.runtime.reload()
  }

  openWindow ({ url }) {
    if(extension.tabs) {
      extension.tabs.create({url})
    }
    else {
      window.open(url)
    }
  }

  getVersion () {
    return extension.runtime.getManifest().version
  }

  openExtensionInBrowser () {
    const extensionURL = extension.runtime.getURL('home.html')
    this.openWindow({ url: extensionURL })
  }

  getPlatformInfo (cb) {
    try {
      extension.runtime.getPlatformInfo((platform) => {
        cb(null, platform)
      })
    } catch (e) {
      cb(e)
    }
  }
}

module.exports = ExtensionPlatform
