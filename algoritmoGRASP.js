const params = $input.first().json;
const ALPHA    = params.ALPHA;
const MAX_ITER = params.MAX_ITER;
const N = 8;
function calcConflitos(state) {
  let c = 0;
  for (let i = 0; i < N - 1; i++)
    for (let j = i + 1; j < N; j++) {
      if (state[i] === state[j]) c++;
      if (Math.abs(state[i] - state[j]) === Math.abs(i - j)) c++;
    }
  return c;
}
function construirSolucao(alpha) {
  const s = new Array(N).fill(0);
  for (let col = 0; col < N; col++) {
    const candidatos = [];
    for (let linha = 0; linha < N; linha++) {
      const t = [...s]; t[col] = linha;
      candidatos.push({ linha, custo: calcConflitos(t) });
    }
    const cMin = Math.min(...candidatos.map(c => c.custo));
    const cMax = Math.max(...candidatos.map(c => c.custo));
    const limiar = cMin + alpha * (cMax - cMin);
    const rcl = candidatos.filter(c => c.custo <= limiar);
    s[col] = rcl[Math.floor(Math.random() * rcl.length)].linha;
  }
  return s;
}
function buscaLocal(estado) {
  let atual = [...estado];
  let hAtual = calcConflitos(atual);
  let melhorou = true;
  while (melhorou && hAtual > 0) {
    melhorou = false;
    let melhorH = hAtual, melhorMov = null;
    for (let col = 0; col < N; col++)
      for (let linha = 0; linha < N; linha++) {
        if (linha === atual[col]) continue;
        const viz = [...atual]; viz[col] = linha;
        const hv = calcConflitos(viz);
        if (hv < melhorH) { melhorH = hv; melhorMov = { col, linha }; }
      }
    if (melhorMov) { atual[melhorMov.col] = melhorMov.linha; hAtual = melhorH; melhorou = true; }
  }
  return { estado: atual, h: hAtual };
}
const resultados = [];
for (let rodada = 1; rodada <= 50; rodada++) {
  const t0 = Date.now();
  let melhorSolucao = null, melhorH = Infinity;
    let iters = 0;
  for (let it = 0; it < MAX_ITER; it++) {
    iters = it + 1;
    const { estado, h } = buscaLocal(construirSolucao(ALPHA));
    if (h < melhorH) { melhorH = h; melhorSolucao = [...estado]; }
    if (melhorH === 0) break;
  }
  resultados.push({ json: {
    Rodada: rodada,
    Algoritmo: 'GRASP',
    Tempo_ms: Date.now() - t0,
    Iteracoes_Geracoes: iters,
    Melhor_Solucao: JSON.stringify(melhorSolucao),
    Fitness_Final_h: melhorH,
    Sucesso: melhorH === 0 ? 'SIM' : 'NAO'
  }});
}
return resultados; 
