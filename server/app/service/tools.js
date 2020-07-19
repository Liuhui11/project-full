'use strict';
const path = require('path');
const fes = require('fs-extra');
const { Service } = require('egg');
const nodemailer = require('nodemailer');

const userEmail = 'hayley894506380@126.com';
const transporter = nodemailer.createTransport({
  service: '126',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'RJUNSTDKWDMYWRLB',
  },
});

class ToolService extends Service {
  async mergeFile(filePath, fileHash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash); // 切片的文件夹
    let chunks = await fes.readdir(chunkDir);
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    chunks = chunks.map(cp => path.resolve(chunkDir, cp));
    await this.mergeChunks(chunks, filePath, size);
  }

  async mergeChunks(files, dest, size) { // node文件流
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fes.createReadStream(filePath);
      readStream.on('end', () => {
        fes.unlinkSync(filePath); // 把当前碎片删除
        resolve();
      });
      readStream.pipe(writeStream); // 写入
    });

    await Promise.all(
      files.map((file, index) => {
        pipStream(file, fes.createReadStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }));
      })
    );

  }

  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html,
    };
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log('email error', error);
      return false;
    }
  }
}

module.exports = ToolService;
