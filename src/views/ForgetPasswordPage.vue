<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/login" /></ion-buttons>
        <ion-title>Recuperar senha</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p>Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>

      <ion-input v-model="email" type="email" label="E-mail" label-placement="floating" fill="outline" />

      <ion-text color="danger" v-if="erro"><p>{{ erro }}</p></ion-text>
      <ion-text color="success" v-if="mensagem"><p>{{ mensagem }}</p></ion-text>

      <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="enviar">
        {{ loading ? 'Enviando...' : 'Enviar link' }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonInput, IonButton, IonText,
} from '@ionic/vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const email = ref('')
const erro = ref('')
const mensagem = ref('')
const loading = ref(false)

async function enviar() {
  erro.value = ''
  mensagem.value = ''
  if (!email.value) { erro.value = 'Informe o e-mail.'; return }

  loading.value = true
  try {
    await sendPasswordResetEmail(auth, email.value)
    mensagem.value = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha. Olhe também o spam.'
  } catch (e: any) {
    erro.value = e.code === 'auth/invalid-email' ? 'E-mail inválido.' : 'Não foi possível enviar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>