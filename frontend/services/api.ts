// // ==============================================================================
// // File: frontend/services/api.ts (FINAL PROFESSIONAL VERSION - WITH LOGGING)
// // Description: Central Axios instance with robust interceptors for request
// //              authentication and automatic, transparent token refreshing.
// // ==============================================================================

// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // --- הגדרת המשתנים הגלובליים של המנגנון ---
// let isRefreshing = false;
// let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void; }> = [];

// // פונקציית עזר שמעבדת את כל הבקשות שהמתינו בתור
// const processQueue = (error: AxiosError | null, token: string | null = null) => {
//     console.log('[API Interceptor] Processing queue. Error:', error ? 'Yes' : 'No', 'Token:', token ? 'Yes' : 'No');
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve(token);
//         }
//     });

//     failedQueue = [];
// };

// // יצירת ה-instance המרכזי עם כתובת ה-API הבסיסית
// const api = axios.create({
//     baseURL: 'http://10.0.2.2:8000/api',
// });

// // --- Interceptor של הבקשות (ללא שינוי) ---
// api.interceptors.request.use(
//     async (config) => {
//         console.log(`[API Interceptor] Sending request to: ${config.url}`);
//         const token = await AsyncStorage.getItem('accessToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//             console.log('[API Interceptor] Token attached to request.');
//         } else {
//             console.log('[API Interceptor] No token found.');
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // --- Interceptor חדש ומשודרג של התגובות ---
// api.interceptors.response.use(
//     (response) => {
//         console.log(`[API Interceptor] Received successful response from: ${response.config.url}`);
//         return response; // אם התגובה תקינה, מחזירים אותה
//     },
//     async (error: AxiosError) => {
//         const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
//         console.error(`[API Interceptor] Received error for ${originalRequest.url}. Status: ${error.response?.status}`);

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             console.log('[API Interceptor] Detected 401 error. Attempting token refresh...');
            
//             if (isRefreshing) {
//                 console.log('[API Interceptor] Refresh already in progress. Adding request to queue.');
//                 // אם כבר מתבצע רענון, מוסיפים את הבקשה הנוכחית לתור
//                 return new Promise(function (resolve, reject) {
//                     failedQueue.push({ resolve, reject });
//                 })
//                     .then(token => {
//                         console.log('[API Interceptor] Retrying request from queue with new token.');
//                         originalRequest.headers['Authorization'] = 'Bearer ' + token;
//                         return api(originalRequest);
//                     })
//                     .catch(err => {
//                         return Promise.reject(err);
//                     });
//             }

//             originalRequest._retry = true;
//             isRefreshing = true;

//             const refreshToken = await AsyncStorage.getItem('refreshToken');
//             if (!refreshToken) {
//                 console.error('[API Interceptor] No refresh token found. Aborting refresh.');
//                 isRefreshing = false;
//                 return Promise.reject(error);
//             }

//             try {
//                 console.log('[API Interceptor] Sending refresh token to server...');
//                 // שולחים בקשה לרענון הטוקן
//                 const rs = await axios.post('http://10.0.2.2:8000/api/auth/refresh/', {
//                     refresh: refreshToken,
//                 });

//                 const { access } = rs.data;
//                 await AsyncStorage.setItem('accessToken', access);
//                 console.log('[API Interceptor] New access token received and stored.');

//                 // מעדכנים את הטוקן הדיפולטיבי עבור כל הבקשות הבאות
//                 api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                
//                 // מעבדים את התור עם הטוקן החדש
//                 processQueue(null, access);

//                 console.log('[API Interceptor] Retrying original request with new token.');
//                 // מנסים שוב את הבקשה המקורית
//                 return api(originalRequest);
//             } catch (refreshError) {
//                 console.error("[API Interceptor] CRITICAL: Token refresh failed!", refreshError);
//                 // אם הרענון נכשל, מנקים את התור עם שגיאה
//                 processQueue(refreshError as AxiosError, null);
//                 // כאן אפשר להפעיל לוגיקת יציאה מהמערכת
//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false;
//             }
//         }

//         return Promise.reject(error);
//     }
// );

// export default api;


// ==============================================================================
// File: frontend/services/api.ts (FINAL VERSION - INTEGRATED WITH AuthContext LOGOUT)
// ==============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Global signOut callback ---
let onSignOutCallback: (() => Promise<void>) | null = null; // שינוי שם המשתנה לבהירות

export const setOnSignOut = (callback: () => Promise<void>) => {
    onSignOutCallback = callback;
    console.log('[API Interceptor] signOut callback successfully set.');
};

// --- הגדרת המשתנים הגלובליים של המנגנון ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void; }> = [];

// פונקציית עזר שמעבדת את כל הבקשות שהמתינו בתור
const processQueue = (error: AxiosError | null, token: string | null = null) => {
    console.log('[API Interceptor] Processing queue. Error:', error ? 'Yes' : 'No', 'Token:', token ? 'Yes' : 'No');
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// יצירת ה-instance המרכזי עם כתובת ה-API הבסיסית
const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api',
});

// --- Interceptor של הבקשות ---
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Interceptor חדש ומשודרג של התגובות ---
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh/'); 

        // אם השגיאה היא 401, וזו לא בקשה חוזרת, וזו לא בקשת ריענון עצמה
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
            console.log(`[API Interceptor] Detected 401 for ${originalRequest.url}. Attempting token refresh...`);
            
            if (isRefreshing) {
                console.log('[API Interceptor] Refresh already in progress. Adding request to queue.');
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        console.log('[API Interceptor] Retrying request from queue with new token.');
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.error('[API Interceptor] No refresh token found. Aborting refresh.');
                isRefreshing = false;
                // <--- כשל קריטי: אין רענון טוקן, צריך להתנתק!
                if (onSignOutCallback) {
                    await onSignOutCallback(); // הפעלת ה-logout מה-AuthContext
                } else {
                    console.error('[API Interceptor] signOut callback not set! Cannot log out automatically.');
                }
                return Promise.reject(error); // דוחה את השגיאה, שתגיע לקומפוננטה.
            }

            try {
                console.log('[API Interceptor] Sending refresh token to server...');
                const rs = await axios.post('http://10.0.2.2:8000/api/auth/refresh/', {
                    refresh: refreshToken,
                });

                const { access, refresh: newRefreshToken } = rs.data; 
                await AsyncStorage.setItem('accessToken', access);
                if (newRefreshToken) { 
                    await AsyncStorage.setItem('refreshToken', newRefreshToken);
                    console.log('[API Interceptor] New refresh token received and stored.');
                }
                console.log('[API Interceptor] New access token received and stored.');

                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                
                processQueue(null, access);

                console.log('[API Interceptor] Retrying original request with new token.');
                return api(originalRequest);
            } catch (refreshError) {
                console.error("[API Interceptor] CRITICAL: Token refresh failed! Logging out user.", refreshError);
                processQueue(refreshError as AxiosError, null);
                // <--- כשל קריטי: רענון נכשל, צריך להתנתק!
                if (onSignOutCallback) {
                    await onSignOutCallback(); // הפעלת ה-logout מה-AuthContext
                } else {
                    console.error('[API Interceptor] signOut callback not set! Cannot log out automatically.');
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // אם השגיאה אינה 401 מטופלת או שזו בקשת הריענון עצמה, דוחה את השגיאה כרגיל.
        // נדפיס את השגיאה רק אם היא לא שגיאת 401 מטופלת (כי אז הדפסנו כבר LOG)
        if (!(error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest)) {
             console.error(`[API Interceptor] Received error for ${originalRequest.url}. Status: ${error.response?.status}`, error);
        }
        return Promise.reject(error);
    }
);

export default api;