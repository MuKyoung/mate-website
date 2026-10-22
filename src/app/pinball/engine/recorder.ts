// lazygyu/roulette (MIT, ./LICENSE) 의 utils/videoRecorder.ts.
// 원본은 형식과 상관없이 .mp4 로 저장해서, 브라우저가 실제로 녹화하는 형식을 골라 확장자를 맞췄다.
import { pad } from './utils';

const FORMATS = [
  { mimeType: 'video/mp4;codecs=avc1', ext: 'mp4' },
  { mimeType: 'video/mp4', ext: 'mp4' },
  { mimeType: 'video/webm;codecs=vp9', ext: 'webm' },
  { mimeType: 'video/webm', ext: 'webm' },
];

/** 판 하나를 녹화해 끝나면 영상 파일로 내려받게 한다 */
export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  /** 화면을 떠나며 멈출 때는 녹화하던 영상을 내려받지 않는다 */
  private discarded = false;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  public get isRecording() {
    return this.mediaRecorder?.state === 'recording';
  }

  public async start() {
    if (this.isRecording) return;
    const format = FORMATS.find((f) => MediaRecorder.isTypeSupported(f.mimeType));
    const recorder = new MediaRecorder(this.canvas.captureStream(), {
      mimeType: format?.mimeType,
      videoBitsPerSecond: 6000000,
    });
    this.mediaRecorder = recorder;

    return new Promise<void>((rs) => {
      this.chunks = [];
      recorder.ondataavailable = (e: BlobEvent) => {
        this.chunks.push(e.data);
      };
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        if (this.discarded) return;
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        const d = new Date();

        downloadLink.href = videoUrl;
        downloadLink.download = `mate_pinball_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.${format?.ext ?? 'webm'}`;
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(videoUrl);
      };
      recorder.onstart = () => {
        rs();
      };
      recorder.start();
    });
  }

  public stop() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  public discard() {
    this.discarded = true;
    this.stop();
  }
}
