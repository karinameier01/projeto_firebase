<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/login" /></ion-buttons>
        <ion-title>Criar conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-input v-model="email" type="email" label="E-mail" label-placement="floating" fill="outline" />
      <ion-input v-model="senha" type="password" label="Senha" label-placement="floating" fill="outline" class="ion-margin-top" />
      <ion-input v-model="confirmar" type="password" label="Confirmar senha" label-placement="floating" fill="outline" class="ion-margin-top" />

      <ion-text color="danger" v-if="erro"><p>{{ erro }}</p></ion-text>

      <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="cadastrar">
        {{ loading ? 'Criando...' : 'Criar conta' }}
      </ion-button>
      <ion-button expand="block" fill="clear" router-link="/login">Já tenho conta</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonInput, IonButton, IonText,
} from '@ionic/vue'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const router = useRouter()
const email = ref('')
const senha = ref('')
const confirmar = ref('')
const erro = ref('')
const loading = ref(false)

function traduzirErro(code: string) {
  switch (code) {
    case 'auth/email-already-in-use': return 'Esse e-mail já está cadastrado.'
    case 'auth/invalid-email': return 'E-mail inválido.'
    case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.'
    default: return 'Não foi possível criar a conta. Tente novamente.'
  }
}

async function cadastrar() {
  erro.value = ''
  if (!email.value || !senha.value) { erro.value = 'Preencha e-mail e senha.'; return }
  if (senha.value.length < 6) { erro.value = 'A senha deve ter pelo menos 6 caracteres.'; return }
  if (senha.value !== confirmar.value) { erro.value = 'As senhas não conferem.'; return }

  loading.value = true
  try {
    await createUserWithEmailAndPassword(auth, email.value, senha.value)
await signOut(auth)
router.replace('/login')
  } catch (e: any) {
    erro.value = traduzirErro(e.code)
  } finally {
    loading.value = false
  }
}
</script>