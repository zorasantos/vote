<script setup lang="ts">
import { Plus, Trash2, Users } from "lucide-vue-next";
import { reactive, watch } from "vue";
import BaseButton from "~/components/common/BaseButton.vue";
import BaseModal from "~/components/common/BaseModal.vue";
import { DEFAULT_BOARD_ROLES } from "~/domain/constants";
import type { Slate, SlateMember } from "~/domain/types";

const props = defineProps<{
  modelValue: boolean;
  slateToEdit?: Slate | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (
    e: "save",
    data: {
      number: string;
      name: string;
      slogan?: string;
      members: SlateMember[];
    },
  ): void;
}>();

const form = reactive<{
  number: string;
  name: string;
  slogan: string;
  members: SlateMember[];
}>({
  number: "01",
  name: "",
  slogan: "",
  members: [],
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.slateToEdit) {
        form.number = props.slateToEdit.number;
        form.name = props.slateToEdit.name;
        form.slogan = props.slateToEdit.slogan || "";
        form.members = JSON.parse(JSON.stringify(props.slateToEdit.members));
      } else {
        form.number = "01";
        form.name = "";
        form.slogan = "";
        // Inicializa com cargos padrão
        form.members = [
          { id: crypto.randomUUID(), role: "Presidente", name: "" },
          { id: crypto.randomUUID(), role: "Vice-Presidente", name: "" },
          { id: crypto.randomUUID(), role: "1º Secretário", name: "" },
          { id: crypto.randomUUID(), role: "1º Tesoureiro", name: "" },
        ];
      }
    }
  },
);

function addMember() {
  form.members.push({
    id: crypto.randomUUID(),
    role: "",
    name: "",
  });
}

function removeMember(index: number) {
  form.members.splice(index, 1);
}

function handleSave() {
  if (!form.name.trim()) return;
  emit("save", {
    number: form.number.trim(),
    name: form.name.trim(),
    slogan: form.slogan.trim() || undefined,
    members: form.members.filter((m) => m.name.trim().length > 0),
  });
  emit("update:modelValue", false);
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="slateToEdit ? 'Editar Chapa' : 'Cadastrar Nova Chapa'"
    description="Informe os dados da chapa e a relação nominal de candidatos aos cargos."
    max-width="xl"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <form @submit.prevent="handleSave" class="space-y-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <!-- Número da Chapa -->
        <div class="sm:col-span-1">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Número <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.number"
            type="text"
            required
            placeholder="01"
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 font-bold"
          />
        </div>

        <!-- Nome da Chapa -->
        <div class="sm:col-span-3">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nome Oficial da Chapa <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: Chapa 1 — Renovação e Transparência"
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 font-semibold"
          />
        </div>

        <!-- Lema/Slogan -->
        <div class="sm:col-span-4">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Lema / Slogan (Opcional)
          </label>
          <input
            v-model="form.slogan"
            type="text"
            placeholder="Ex: Juntos por uma associação participativa e ética"
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <!-- Integrantes da Chapa -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Users class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              Integrantes da Mesa Diretora & Conselho
            </h3>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            @click="addMember"
          >
            <Plus class="w-3.5 h-3.5" />
            Adicionar Cargo
          </button>
        </div>

        <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          <div
            v-for="(member, idx) in form.members"
            :key="member.id"
            class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <!-- Cargo (com datalist ou texto livre) -->
            <input
              v-model="member.role"
              type="text"
              required
              list="default-roles"
              placeholder="Cargo (ex: Presidente)"
              class="w-2/5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900"
            />
            <datalist id="default-roles">
              <option v-for="role in DEFAULT_BOARD_ROLES" :key="role" :value="role" />
            </datalist>

            <!-- Nome Completo -->
            <input
              v-model="member.name"
              type="text"
              required
              placeholder="Nome Completo do Candidato"
              class="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900"
            />

            <!-- Remover Cargo -->
            <button
              type="button"
              class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Remover integrante"
              @click="removeMember(idx)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <BaseButton variant="outline" size="md" @click="emit('update:modelValue', false)">
          Cancelar
        </BaseButton>
        <BaseButton type="submit" variant="primary" size="md">
          Salvar Chapa
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
