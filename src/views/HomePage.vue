<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Início</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="sair">Sair</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="boas-vindas">
        <ion-avatar class="avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Foto de perfil" />
          <div v-else class="avatar-vazio">Sem foto</div>
        </ion-avatar>

        <h1>Bem-vindo, {{ nomeExibido }}!</h1>
        <p class="email">{{ email }}</p>

        <ion-button expand="block" class="ion-margin-top" router-link="/profile">Meu perfil</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonContent, IonButton, IonAvatar, onIonViewWillEnter,
} from '@ionic/vue'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const router = useRouter()
const nomeExibido = ref('')
const email = ref('')
const avatarUrl = ref('')

onIonViewWillEnter(carregar)

async function carregar() {
  const user = auth.currentUser
  if (!user) return

  email.value = user.email ?? ''

  const perfil = await getDoc(doc(db, 'users', user.uid))
  const dados = perfil.exists() ? perfil.data() : null
  nomeExibido.value = dados?.nickname || dados?.nome || user.email || ''

  const foto = await getDoc(doc(db, 'images', user.uid))
  avatarUrl.value = foto.exists() ? foto.data().image : ''
}

async function sair() {
  await signOut(auth)
  router.replace('/login')
}
</script>

<style scoped>
.boas-vindas { display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 32px; }
.avatar { width: 120px; height: 120px; margin-bottom: 16px; }
.avatar-vazio {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: var(--ion-color-light); color: var(--ion-color-medium); font-size: 14px;
}
.email { color: var(--ion-color-medium); margin: 0; }
</style>