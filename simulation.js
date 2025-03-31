const RandomWalkSimulation = () => {
  const [params, setParams] = React.useState({
    opt: 0,
    N: 1000,
    useRawSum: false, // Nouvelle option pour utiliser la somme brute
  });
  const [animationSpeed, setAnimationSpeed] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  const trajectoryRef = React.useRef(null);

  const zeta = (s) => {
    let sum = 0;
    for (let k = 1; k < 1000; k++) {
      sum += 1 / Math.pow(k, s);
    }
    return sum;
  };

  const sim = (opt) => {
    switch (opt) {
      case 1: {
        const U = Math.random();
        return U > 0.5 ? 10 : -5;
      }
      case 0:
        return 1;
      case 2: {
        const ct = 1 / zeta(3);
        let U = Math.random();
        let p = 0;
        let k = 0;
        while (U > p) {
          k = k + 1;
          p = p + ct / (Math.pow(k, 3));
        }
        return k % 2 === 0 ? -k : k;
      }
      default: {
        let U = Math.random();
        const ct = 6 / (Math.PI * Math.PI);
        let p = 0;
        let k = 0;
        while (U > p) {
          k = k + 1;
          p = p + ct / (k * k);
        }
        return k % 2 === 0 ? -k : k;
      }
    }
  };

  const generateTrajectory = React.useCallback(() => {
    let totCas = 0;
    const values = [0];
    
    const steps = Array.from({length: params.N + 1}, (_, i) => i);
    
    const a = params.opt === 1 ? 5/2 :
             params.opt === 3 ? Math.log(2) :
             params.opt === 2 ? Math.PI * Math.PI / (12 * zeta(3) ) : 1;
    const expected = [0]; // Commencer à 0 pour avoir la même longueur que values
    
    for (let i = 1; i <= params.N; i++) {
      totCas += sim(params.opt);
      // Utiliser la somme brute ou la moyenne selon l'option choisie
      values.push(params.useRawSum ? totCas : totCas/i);
      // Si nous utilisons la somme brute, la valeur attendue est multipliée par i
      expected.push(params.useRawSum ? a * i : a);
    }
    
    return { steps, values, expected };
  }, [params.N, params.opt, params.useRawSum]);

  // Generate new trajectory only when parameters change
  React.useEffect(() => {
    trajectoryRef.current = generateTrajectory();
    setCurrentStep(0);
    updateChart(0);
  }, [params, generateTrajectory]);

  const updateChart = React.useCallback((step) => {
    if (!chartRef.current || !trajectoryRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const { steps, values, expected } = trajectoryRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: steps.slice(0, step + 1),
        datasets: [
          {
            label: params.useRawSum ? 'Somme des tirages' : 'Valeur moyenne des tirages',
            data: values.slice(0, step + 1),
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            pointRadius: 0,
            tension : 0,
            stepped: true
          },
          {
            label: params.useRawSum ? 'Somme attendue (le cas échéant)' : 'Valeur attendue (le cas échéant)',
            data: expected.slice(0, step + 1),
            borderColor: 'rgb(255, 0, 132)',
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          y: {
            beginAtZero: false
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }, [params.useRawSum]);

  // Update chart when currentStep changes
  React.useEffect(() => {
    if (trajectoryRef.current) {
      updateChart(currentStep);
    }
  }, [currentStep, updateChart]);

  React.useEffect(() => {
    let interval;
    if (isPlaying && currentStep < params.N) {
      interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, params.N));
      }, animationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, params.N, animationSpeed]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simulation de Marche Aléatoire</h1>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type de Simulation:</label>
            <select 
              className="w-full rounded border shadow-sm p-2"
              value={params.opt}
              onChange={(e) => {
                setParams(prev => ({ ...prev, opt: parseInt(e.target.value) }));
                setIsPlaying(false);
              }}
            >
              <option value={0}>Constante</option>
              <option value={2}>Y</option>
              <option value={3}>X</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de Pas (N):</label>
            <input
              type="number"
              className="w-full rounded border shadow-sm p-2"
              value={params.N}
              onChange={(e) => {
                setParams(prev => ({ ...prev, N: Math.max(1, parseInt(e.target.value) || 0) }));
                setIsPlaying(false);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vitesse d'Animation (ms):</label>
            <input
              type="number"
              className="w-full rounded border shadow-sm p-2"
              value={animationSpeed}
              min="1"
              max="1000"
              onChange={(e) => setAnimationSpeed(Math.max(1, parseInt(e.target.value) || 50))}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center text-sm font-medium">
              <input
                type="checkbox"
                className="mr-2 h-5 w-5"
                checked={params.useRawSum}
                onChange={(e) => {
                  setParams(prev => ({ ...prev, useRawSum: e.target.checked }));
                  setIsPlaying(false);
                }}
              />
              Utiliser la somme brute
            </label>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pause' : 'Lancer'}
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
          >
            Réinitialiser
          </button>
        </div>
        <div className="h-96 border rounded p-4">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};