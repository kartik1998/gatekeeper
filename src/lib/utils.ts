/**
 * @returns a uuid string
 */
function uuid(): string {
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * checks if a string is a valid json
 * @param str 
 */
function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * @param message 
 * @param level 
 */
function log(message: any, level?: string) {
  let text = message;
  if (isJSON(message)) text = JSON.stringify(message);
  console.log(`[${level || 'DEBUG'}] ${message}`);
}

export { uuid, isJSON, log };
