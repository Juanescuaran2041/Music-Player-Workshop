export class Song {
  prev: Song | null = null;
  next: Song | null = null;

  constructor(
    public id: string,
    public title: string,
    public artist: string,
    public duration: number,
    public url: string,
    public cover: string = "",
    public videoId: string = "",
  ) {}
}
