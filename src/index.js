const MpUploadOssHelper = require("./uploadOssHelper.js");

class WxUpload {
	/**
	 * @description 参数以对象形式传入
	 * @param {String} accessKeyId
	 * @param {String} accessKeySecret
	 * @param {Number} timeout
	 * @param {Number} maxSize
	 * @param {Number} expirationTime 
	 */
	constructor(ops) {
		this.accessKeyId = ops.accessKeyId;
		this.accessKeySecret = ops.accessKeySecret;
		// 限制参数的生效时间，单位为小时，默认值为1。
		this.timeout = ops.timeout || 1;
		// 限制上传文件的大小，单位为MB，默认值为10。
		this.maxSize = ops.maxSize || 10;
		this.expirationTime = expirationTime
	}


	uploadParams = {} // 上传所需参数
	expirationTime = null; //过期时间

	getUploadHeper() {
		return new Promise((resolve, reject) => {
			if (!this.expirationTime || Date.now() > new Date(this.expirationTime).getTime()) {
				const mpHelper = new MpUploadOssHelper({
					accessKeyId: this.accessKeyId,
					accessKeySecret: this.accessKeySecret,
					timeout: this.timeout, // 限制参数的生效时间，单位为小时，默认值为1。
					maxSize: this.maxSize, // 限制上传文件大小，单位为MB，默认值为10。
				})

				const params = mpHelper.createUploadParams();
				this.uploadParams = params;
				resolve({
					params: params
				})
			} else {
				resolve({
					params: uploadParams
				})
			}

		})
	}

	/**
	 * @description 参数以对象形式传入
	 * @param {String} host 存储空间访问域名
	 * @param {String} folder 文件存放位置路径，例如 /xx/xx/
	 * @param {String} filePath 本地上传文件路径
	 * @param {String} fileName 本地上传文件名称
	 * @param {String} securityToken STS签名Token。
	 */
	async uploadFile(ops) {
		
		await this.getUploadHeper()
		
		return new Promise((resolve, reject) => {

			let tmp = ops.filePath.split('/')
			let fileName = tmp[tmp.length - 1]
			let ossUrl = ops.folder + fileName

			wx.uploadFile({
				url: ops.host, // 开发者服务器的URL。
				filePath: ops.filePath,
				name: ops.fileName || 'file', // 必须填file。
				formData: {
					key: ossUrl,
					policy: this.uploadParams.policy,
					OSSAccessKeyId: this.uploadParams.OSSAccessKeyId,
					signature: this.uploadParams.signature,
					'x-oss-security-token': ops.securityToken // 使用STS签名时必传。
				},
				success(res) {
					if (res.statusCode === 204) {
						resolve({
							url: ops.host + ossUrl
						})
					} else {
						reject(res)
					}
				},
				fail(err) {
					reject(err)
				}
			});
		})
	}
}


module.exports = WxUpload;
