interface options {
  classes: string,
}

interface value {
  nameofthesong: string,
    robloxcode: string
    ___id___: string
}

export interface ISong {
  options: options
  value: value
}

export interface IParseSong {
  id: number,
  name: string
  code: number,
}