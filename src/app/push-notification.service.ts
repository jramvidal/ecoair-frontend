import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private messaging: any;

  constructor(private http: HttpClient, private authService: AuthService) {
    try {
      // Inicializamos la app de Firebase con la config que pusimos en environment
      const app = initializeApp(environment.firebase);
      this.messaging = getMessaging(app);
      this.listenForForegroundMessages();
    } catch (e) {
      console.error('Error inicializando Firebase:', e);
    }
  }

  /**
   * Pide permiso al usuario (si no lo tiene) y obtiene el token FCM.
   * Luego lo envía al backend para que lo guarde en user_devices.
   */
  async requestPermissionAndGetToken() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Permiso de notificaciones concedido.');
        
        // Obtenemos el token de FCM usando la clave VAPID
        const currentToken = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey
        });

        if (currentToken) {
          console.log('FCM Token obtenido:', currentToken);
          this.sendTokenToBackend(currentToken);
        } else {
          console.log('No se pudo obtener el token FCM.');
        }
      } else {
        console.warn('El usuario denegó el permiso para notificaciones.');
      }
    } catch (error) {
      console.error('Error al solicitar permisos o generar el token:', error);
    }
  }

  /**
   * Escucha notificaciones cuando la app está abierta en pantalla.
   * Las notificaciones en segundo plano ya las gestiona firebase-messaging-sw.js
   */
  private listenForForegroundMessages() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Notificación recibida en PRIMER PLANO:', payload);
      // Aquí podrías mostrar un Toast/Snackbar en Angular para avisar al usuario
      // de la alerta mientras navega.
    });
  }

  /**
   * Envía el token a nuestro servidor NestJS
   */
  private sendTokenToBackend(token: string) {
    const userId = this.authService.getUserId();
    if (!userId) {
        console.warn('No hay usuario logueado, no se puede guardar el token');
        return;
    }

    const url = `${environment.apiUrl}/users/${userId}/devices`;
    const body = {
      fcmToken: token,
      deviceType: 'web'
    };

    this.http.post(url, body).subscribe({
      next: () => console.log('Token guardado en el backend con éxito.'),
      error: (err) => console.error('Error guardando token en backend:', err)
    });
  }
}
