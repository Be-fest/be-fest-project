# 🚀 Como Sincronizar com o Vercel

## Fluxo de Trabalho Recomendado

### Opção 1: Usando o Script Automático (Mais Fácil)

1. **Faça suas alterações normalmente** no código
2. **Commit pelo GitHub Desktop**:
   - Escreva sua mensagem de commit
   - Clique em "Commit to main"
   - Clique em "Push origin"
3. **Execute o script**:
   - Dê duplo clique no arquivo `sync-vercel.bat`
   - O script vai automaticamente:
     - ✅ Mudar para o branch do Vercel
     - ✅ Fazer merge do main
     - ✅ Fazer push
     - ✅ Voltar para o main
4. **Acompanhe o deploy** no Vercel Dashboard

### Opção 2: Manual (Se o script não funcionar)

1. Commit suas alterações no `main`
2. Abra o terminal/cmd na pasta do projeto
3. Execute os comandos:
```bash
git checkout vercel/react-server-components-cve-vu-ixx7rq
git merge main
git push origin vercel/react-server-components-cve-vu-ixx7rq
git checkout main
```

## Solução de Problemas

### "Conflitos detectados no merge"
- Isso acontece quando há mudanças conflitantes
- Resolva os conflitos manualmente
- Execute: `git add .` e `git commit -m "Resolve conflicts"`
- Execute o script novamente

### "Falha ao fazer push"
- Verifique sua conexão com a internet
- Verifique se está autenticado no Git
- Tente fazer push manualmente

## Dicas

- ⚠️ **Sempre faça commit no `main` primeiro** antes de executar o script
- 📦 O script salva alterações locais automaticamente (stash)
- 🔄 Após o push, o Vercel faz deploy automaticamente
- ⏱️ O deploy leva cerca de 2-5 minutos

## Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard) - Acompanhe seus deployments
- [GitHub Repository](https://github.com/Be-fest/be-fest-project) - Seu repositório
