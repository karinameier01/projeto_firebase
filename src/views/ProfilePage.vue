<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>Meu perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="avatar-box">
        <!-- Avatar clicável -->
        <ion-avatar class="avatar" @click="dispararSeletor">
          <img v-if="imagem" :src="imagem" alt="Foto de perfil" />
          <div v-else class="avatar-vazio">Sem foto</div>
        </ion-avatar>
        
        <ion-button fill="clear" size="small" :disabled="enviandoFoto" @click="dispararSeletor">
          {{ enviandoFoto ? 'A carregar...' : 'Alterar foto' }}
        </ion-button>

        <!-- Input de arquivo nativo posicionado no DOM de forma visível mas transparente -->
        <input 
          id="input-arquivo-oculto"
          type="file" 
          accept="image/*" 
          style="display: none;"
          @change="tratarSelecaoArquivo" 
        />
      </div>

      <ion-input v-model="nome" label="Nome" label-placement="floating" fill="outline"></ion-input>
      <ion-input v-model="nickname" label="Nickname" label-placement="floating" fill="outline" class="ion-margin-top"></ion-input>
      <ion-input v-model="dataNascimento" type="date" label="Data de nascimento" label-placement="stacked" fill="outline" class="ion-margin-top"></ion-input>

      <ion-text color="danger" v-if="erro"><p>{{ erro }}</p></ion-text>
      <ion-text color="success" v-if="sucesso"><p>Perfil salvo com sucesso!</p></ion-text>

      <ion-button expand="block" class="ion-margin-top" :disabled="loading" @click="salvar">Salvar</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonInput, IonButton, IonText, IonAvatar,
} from '@ionic/vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const nome = ref('')
const nickname = ref('')
const dataNascimento = ref('')
const imagem = ref('')
const erro = ref('')
const sucesso = ref(false)
const loading = ref(false)
const enviandoFoto = ref(false)

onMounted(carregar)

async function carregar() {
  const user = auth.currentUser
  if (!user) return

  try {
    const docRef = doc(db, 'users', user.uid)
    const perfil = await getDoc(docRef)
    if (perfil.exists()) {
      const dados = perfil.data()
      nome.value = dados.nome || ''
      nickname.value = dados.nickname || ''
      dataNascimento.value = dados.dataNascimento || ''
      imagem.value = dados.imagem || ''
    } else {
      nickname.value = user.email?.split('@')[0] || ''
    }
  } catch (e: any) {
    erro.value = 'Erro ao carregar perfil: ' + e.message
  }
}

// Dispara o input usando o ID do elemento diretamente no DOM
function dispararSeletor() {
  const input = document.getElementById('input-arquivo-oculto') as HTMLInputElement
  if (input) {
    input.click()
  }
}

// Processa a imagem escolhida e atualiza a tela na hora
async function tratarSelecaoArquivo(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const arquivo = target.files[0]
  enviandoFoto.value = true
  erro.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    imagem.value = e.target?.result as string
    enviandoFoto.value = false
  }
  reader.onerror = () => {
    erro.value = 'Erro ao ler o ficheiro da imagem.'
    enviandoFoto.value = false
  }
  reader.readAsDataURL(arquivo)
}

async function salvar() {
  const user = auth.currentUser
  if (!user) {
    erro.value = 'Utilizador não autenticado.'
    return
  }

  loading.value = true
  erro.value = ''
  sucesso.value = false

  try {
    // Salva os dados e a imagem (em formato Base64) diretamente no documento do Firestore
    await setDoc(doc(db, 'users', user.uid), {
      nome: nome.value,
      nickname: nickname.value,
      dataNascimento: dataNascimento.value,
      imagem: imagem.value,
    }, { merge: true })

    sucesso.value = true
  } catch (e: any) {
    erro.value = 'Erro ao salvar no banco: ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar {
  width: 96px;
  height: 96px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-vazio {
  width: 100%;
  height: 100%;
  background: var(--ion-color-step-200, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ion-color-step-600, #aaa);
}
</style>