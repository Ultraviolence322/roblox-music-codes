export const parseNameToView = (name: string): string => {
  let result: string = name

  if(name) {
    let separateIndex = result.indexOf('-')
    if(separateIndex !== -1) {
      result = result.substr(0, separateIndex).trim() + '\n' + result.substr(separateIndex + 1, result.length).trim()
  
      return result
    }  
  
    separateIndex = result.indexOf(':')
    if(separateIndex !== -1) {
      result = result.substr(0, separateIndex).trim() + '\n' + result.substr(separateIndex + 1, result.length).trim()
  
      return result
    }  
  }

  return result
}  