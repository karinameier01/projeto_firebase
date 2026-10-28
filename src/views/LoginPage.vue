<template>
  <ion-page>
    <ion-content class="ion-padding">
      <h1>Conecte-se</h1>

      <ion-input v-model="email" type="email" label="E-mail" label-placement="floating" fill="outline" />
      <ion-input v-model="senha" type="password" label="Senha" label-placement="floating" fill="outline" class="ion-margin-top" />

      <ion-text color="danger" v-if="erro"><p>{{ erro }}</p></ion-text>

      <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="entrar">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </ion-button>
      <ion-button expand="block" fill="clear" router-link="/forgot-password">Esqueci minha senha</ion-button>
      <ion-button expand="block" fill="clear" router-link="/register">Criar conta</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonInput, IonButton, IonText } from '@ionic/vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const router = useRouter()
const email = ref('')
const senha = ref('')
const erro = ref('')
const loading = ref(false)

function traduzirErro(code: string) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
    default:
      return 'Não foi possível entrar. Tente novamente.'
  }
}

async function entrar() {
  erro.value = ''
  if (!email.value || !senha.value) { erro.value = 'Preencha e-mail e senha.'; return }

  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, senha.value)
    router.replace('/home')
  } catch (e: any) {
    erro.value = traduzirErro(e.code)
  } finally {
    loading.value = false
  }
}
</script>