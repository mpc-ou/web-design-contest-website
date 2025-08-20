/**
 * Giải mã JWT token
 * @param {string} token - JWT token cần giải mã
 * @returns {Object|null} Phần payload đã giải mã hoặc null nếu lỗi
 */
export function decodeJwt(token) {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const jsonPayload = atob(base64Url);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Kiểm tra xem token có hết hạn chưa
 * @param {string} token - JWT token cần kiểm tra
 * @returns {boolean} True nếu token đã hết hạn
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Lấy thời gian hết hạn từ token
 * @param {string} token - JWT token
 * @returns {Date|null} Thời gian hết hạn hoặc null nếu lỗi
 */
export function getTokenExpiration(token) {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}