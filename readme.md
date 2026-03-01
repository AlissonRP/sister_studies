# 🎀 Estudando Matemática

App web local para praticar matemática básica do 6º ano, desenvolvido com auxílio **Claude Sonnet 4.6**.

## O que é

Aplicação simples com visual temático Hello Kitty para uma aluna do 6º ano praticar as quatro operações básicas. Possui modo livre de prática e modo avaliação estilo prova.

## Funcionalidades

- **Modo prática** — questões infinitas com feedback imediato, GIFs de reação e placar de aproveitamento
- **Modo avaliação** — 5 questões seguidas, sem distração, com resultado final mostrando nota, tempo total e tempo por questão
- Operações geradas dentro do nível adequado ao 6º ano:
  - Soma e subtração com números grandes (sem resultado negativo)
  - Multiplicação e divisão dentro da tabuada do 1 ao 10
  - Divisão com dividendos grandes, sempre resultado exato

## Como usar

**Pré-requisitos:** Python 3.10+ e pip

```bash
# instalar dependência
pip install flask

# rodar
python app.py
```

Abra o navegador em **http://localhost:5000**

## Estrutura

```
├── app.py
├── static/
│   ├── gifs/
│   │   ├── acerto.gif
│   │   └── errado.gif
│   └── images/
│       ├── hello_kitty.png
│       ├── kuromi.png
│       ├── my_melody.png
│       ├── Cinnamoroll.png
│       └── pompompurin.png
└── templates/
    └── index.html
```

