<template>
  <div>
    <h1>用户中心</h1>
    <!-- 拖拽 -->
    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <!-- 进度条 -->
    <div>
      <el-progress :text-inside="true" :percentage="uploadProgress" :stroke-width="30"></el-progress>
    </div>
    <div>
      <el-button @click="uploadFile">上传</el-button>
    </div>
    <div>
      <p>计算hash的进度</p>
      <el-progress :text-inside="true" :percentage="hashProgress" :stroke-width="30"></el-progress>
    </div>
    <!-- 切片进度条 -->
    <div>
      <!-- chunk.progress
        progress < 0 报错 显示红色
        progress == 100 成
        别的数字 方块高度显示
       -->
       <!-- 尽可能让方块看起来是正方形
       比如10个方块 4*4 -->
      <!-- <pre>
        {{chunks|json}}
      </pre> -->
      <div class="cube-container" :style="{width: cubeWidth + 'px'}">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name">
          <div
            :class="{
              'uploading': chunk.progress >= 0 && chunk.progress < 100,
              'success': chunk.progress == 100,
              'error': chunk.progress < 0
            }"
            :style="{height: chunk.progress+'%'}">
            <i class="el-icon-loading" style="color: #f56c6c" v-if="chunk.progress <= 100 && chunk.progress > 0"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const CHUNK_SIZE = 1 * 1024 *1024;
import sparkMD5 from 'spark-md5';
import { toUnicode } from 'punycode';
import { request } from 'https';
export default {
  data() {
    return {
      file: null,
      chunks: [],
      hashProgress: 0,
    }
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length))*16;
    },
    uploadProgress() {
      if (!this.file || this.chunks.length) {
        return 0;
      }
      const loaded = this.chunks.map(item => item.chunk.size*item.progress)
                                .reduce((acc, cur) => acc+cur, 0);
      return parseInt((loaded*100/this.file.size).toFixed(2));
    },
  },
  async mounted() {
    const ret = this.$http.get('/user/info');
    this.bindEvents();
  },
  methods: {
    // 创建chunks数组
    createFileChunk(file, size=CHUNK_SIZE) {
      const chunks = [];
      let cur = 0;
      while(cur < this.file.size) {
        chunks.push({
          index: cur,
          file: this.file.slice(cur, cur+size),
        })
        cur+=size;
      }
      console.log(chunks, 'createFileChunk=======');
      return chunks;
    },
    // webworker
    async calculateHashWorker() {
      return new Promise(resolve => {
        this.worker = new Worker('/hash.js');
        this.worker.postMessage({ chunks: this.chunks });
        this.worker.onmessage = e => {
          const { progress, hash } = e.data;
          this.hashProgress = Number(progress.toFixed(2));
          if (hash) {
            resolve(hash);
          }
        }
      })
    },
    // react时间切片
    async calculateHashIdle() {
      const chunks = this.chunks;
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        let count = 0;
        const appendToSpark = async file => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = e => {
              spark.append(e.target.result);
              resolve();
            }
          });
        }
        const workLoop = async deadline => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            // 空闲时间，且有任务
            await appendToSpark(chunks[count].file);
            count++;
            if (count < chunks.length) {
              this.hashProgress = Number((100*count/chunks.length).toFixed(2));
            } else {
              this.hashProgress = 100;
              resolve(spark.end);
            }
          }
          window.requestIdleCallback(workLoop);
        }
        window.requestIdleCallback(workLoop);
      })
    },
    // 布隆过滤器 判断一个数据存在与否 1个G的文件，抽样后5M以内
    // hash一样，文件不一定一样
    // hash不一样，文件一定不一样
    async calculateHashSample() {
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        const reader = new FileReader();

        const file = this.file;
        const size = file.size;
        const offset = 2 * 1024 * 1024;
        // 第一个2M，最后一个区块数据全要
        // 中间的，取前中后各2个字节
        let chunks = [file.slice(0, offset)];

        let cur = offset;
        if (cur < size) {
          if (cur+offset >= size) {
            // 最后一个区块
            chunks.push(file.slice(cur, cur + offset));
          } else {
            // 中间的区块
            const mid = cur + offset/2;
            const end = cur + offset;
            chunks.push(file.slice(cur, cur+ 2));
            chunks.push(file.slice(mid, mid+ 2));
            chunks.push(file.slice(end-2, end));
          }
          cur += offset
        }
        // 中间的，取前中后各2个字节
        reader.readAsArrayBuffer(new Blob(chunks));
        reader.onload = e => {
          spark.append(e.target.result);
          this.hashProgress = 100;
          resolve(spark.end);
        }
      });
    },
    // 上传chunks
    async uploadChunks() {
      const requests = this.chunks.map((chunk, index) => {
        // 转成promise
        const form = new FormData();
        debugger;
        form.append('chunk', chunk.chunk);
        form.append('hash', chunk.hash);
        form.append('name', chunk.name);
        return form;
      }).map((form, index) => {
        this.$http.post('uploadFile', form, {
          onUploadProgress: progress => {
            // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
            this.chunks[index].progress = Number((progress.loaded/progress.total).toFixed(2)*100);
          }
        })
      });
      // @todo 并发量控制
      console.log(requests, 'ajax=========');
      await Promise.all(requests);
      await this.mergeRequest();
    },
    mergeRequest() {
      this.$http.post('mergeFile', {
        ext: this.file.name.split('.').pop(),
        size: CHUNK_SIZE,
        hash: this.hash,
      });
    },
    // 图片上传
    async uploadFile() {
      this.isImage(this.file); // 校验图片类型限制
      // 切片上传
      this.chunks = this.createFileChunk(this.file);
      const hash = await this.calculateHashWorker();
      // const hash = await this.calculateHashIdle();
      // const hash = await this.calculateHashSample();
      this.hash = hash;
      console.log(this.hash, this.chunks, 'hash========')
      // 抽样hash 不算全量
      // 布隆过滤器 损失一小部分的精度，换取效率
      this.chunks = this.chunks.map((chunk, index) => {
        // 切片的名字 hash+index
        const name = hash + '-' + index;
        return {
          hash,
          name,
          index,
          chunk: chunk.file,
          progress: 0,
        }
      });

      await this.uploadChunks();

      // const form = new FormData();
      // form.append('name', 'file');
      // form.append('file', this.file);
      // const ret = await this.$http.post('uploadFile', form, {
      //   onUploadProgress: progress => {
      //     this.uploadProgress = Number((progress.loaded/progress.total).toFixed(2)*100);
      //   }
      // });
    },
    handleFileChange(e) {
      this.file = e.target.files[0];
      if (!this.file) return;
    },
    bindEvents() {
      const drag = this.$refs.drag;
      drag.addEventListener('dragover', e => {
        drag.style.borderColor = 'red';
        e.preventDefault();
      });
      drag.addEventListener('dragleave', e => {
        drag.style.borderColor = '#eee';
        e.preventDefault();
      });
      drag.addEventListener('drop', e => {
        const fileList = e.dataTransfer.files;
        this.file = fileList[0];
        drag.style.borderColor = '#eee';
        e.preventDefault();
      });
    },
    async blobToString(blob) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function() {
          const ret = reader.result.split('')
                        .map(v => v.charCodeAt())
                        .map(v => v.toString(16).toUpperCase())
                        .join(' ');
          resolve(ret);
        }
        reader.readAsBinaryString(blob);
      })
    },
    async isGif(file) {
      // 前面6个16进制 '47 49 46 38 39 61' '47 49 46 38 37 61'
      // GIF89a和GIF87a
      const ret = await this.blobToString(file.slice(0, 6));
      const isGif = (ret === '47 49 46 38 39 61') || (ret === '47 49 46 38 37 61');
      console.log('isGif', ret, isGif);
      return isGif;
    },
    async isPng(file) {
      const ret = await this.blobToString(file.slice(0, 6));
      const isPng = (ret === '89 50 4E 47 0D 1A 0A');
      console.log('isPng', ret, isPng);
      return isPng;
    },
    async isJpg(file) {
      const len = file.size;
      const start = await this.blobToString(file.slice(0, 2));
      const tail = await this.blobToString(file.slice(-2, len));
      const isJpg = (start === 'FF D8') && (tail === 'FF D9');
      console.log('isJpg', start, tail, isJpg);
      return isJpg;
    },
    async isImage(file) {
      // 通过文件流来判定
      return await this.isGif(file) || await this.isPng(file) || await this.isJpg(file);
    }
  },
}
</script>
<style lang="stylus" scoped>
#drag 
  height 100px
  line-height 100px
  border 2px dashed #eee
  text-align center
  vertical-align middle
.cube-container 
  .cube
    width 14px
    height 14px
    line-height 12px
    border 1px black solid
    background #eee
    float left 
    >.success
      background green
    >.uploading
      background blue
    >.error
      background red
</style>
