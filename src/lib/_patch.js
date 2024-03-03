export const defaultPatch = {
  "name": "2x-van-der-pol",
  "modulation": {
    "code": "import(\"stdfaust.lib\");\n\nui(x) = tgroup(\"Euclid Van der Pol\", x);\nuiseq(x) = ui(hgroup(\"[1]Clock\", x));\n\nN = uiseq(vslider(\"[0]Euclid N\", 15, 2, 21, 1)) : int;\nCLK = uiseq(vslider(\"[0]Clock [scale:log] [unit: bpm]\", 200, 10, 900, 0.1)) : /(60) : si.smoo;\nK1 = uiseq(vslider(\"[1]Euclid K1\", 2, 2, 21, 1)) : min(N);\nK2 = uiseq(vslider(\"[4]Euclid K2\", 7, 2, 21, 1)) : min(N);\nuiRatio = uiseq(vslider(\"[2]E2 Ratio\", 1, 1, 16, 1)) : int;\nuiShift = uiseq(vslider(\"[3]E2 Shift\", 0, -0.5, 0.5, 0.01));\nuiShape = uiseq(hslider(\"[4]RngData\", 0.22, 0, 1, 0.01));\nuiLfn = uiseq(hslider(\"[5]LFN\", 0.22, 0, 1, 0.01));\n\n\neuclid(n, k, clock) = clock : counter : _ with {\n    counter(imp) = (_counter ~ (_,_))(imp) : !,!,_ with {\n        _counter(_i, _e, imp) = i, e, trig with {\n            i = (_i + imp) % n;\n            e = ba.if(imp, descent, _e);\n            descent = (k * _i) % n >= (k * i) % n;\n            trig = imp * e;\n        };\n    };\n};\n\nmclk = os.lf_sawpos(CLK);\n\n\neclk = mclk <: impulsify, (shift : impulsify) : e1, e2 : hold, hold with {\n  impulsify(ramp) = ramp <: -(mem)<0;\n  shift(x) = x + uiShift + 1 : ma.frac;\n  e1(clk) = clk : euclid(N, K1);\n  e2(clk) = clk : cdiv(uiRatio) : euclid(N, K2); \n  hold(imp) = ba.peakholder(20, imp);\n};\n\n\n// utility function\nclip(x) = select2(x>1, x, 1);\n\n// clock divider\ncdiv(ratio, in) = select2(ratio==1, div, in) with {\n    div = in : (inc(ratio) ~ _) <: -(mem)<0 with {\n        inc(r, current, in) = current + in/r : clip : ma.frac;\n    };\n};\n\n// rungler circuit (7-bit register, 3-bit dac)\nrungler73(shuf, data, clock) = data : shift : dac : norm with {\n    // shift register\n    shift = head : tail with {\n        // first cells simply pass their output forward\n        head = latch(clock : @(6)) : latch(clock : @(5)) : latch(clock : @(4)) : latch(clock : @(3));\n        \n        // last 3 cells split their output (to be fed into a 3-bit DAC) \n        tail = latch(clock : @(2)) <: _, (latch(clock : @(1)) <: _, latch(clock));\n\n        // latch cell implementation\n        latch(trig, in) = (trig, in) : (cell ~ _) with {\n            cell(val, trig, in) = select2(trig, val, in) : _;\n        };\n    };\n    // only sample new shuf values on clock signal\n    sshuf = shuf : ba.sAndH(clock);\n    \n    dac(x, y, z) = 4*x + shuffle(2*y + z) : int with {\n        // shuffle input bits based on a seed\n        shuffle(v) = ((v + a) * b) % 4 with {\n            a = int(sshuf/2);\n            b = select2(sshuf%2, 1, 3);\n        };\n    };\n\n    norm(x) = x / 7;\n};\n\n// data line\ndata = os.lf_imptrain(df) : sq : _ with {\n    sq(imp) = imp : (toggle ~ _) with {\n        toggle(state, imp) = ba.if(imp>0, 1-state, state);\n    };\n    // data line frequency\n    df = si.interpolate(cycle(uiShape), 1, 11) * 2 with {\n        // cycles from 0 to 1 two times when x goes 0..1\n        cycle(x) = 1 - 0.5 * (1 + cos(x * 4 * ma.PI));\n    };\n};\n\nprocess = (mclk, e1, e2, rng, lfn) with {\n  e1 = eclk : _,!;\n  e2 = eclk : !,_;\n  rng = rungler73(shuf, data, clock);\n  // dac shuffle covers integer range [0..7] when shape goes 0..1\n  // shuf = int(uiShape * 7.99);\n  shuf = 0;\n  clock = e1 : ba.impulsify;\n  lfn = no.lfnoise(uiLfn);\n};",
    "params": {
      "/Euclid Van der Pol/Clock/Clock": 148.78032589238495,
      "/Euclid Van der Pol/Clock/Euclid N": 14.35,
      "/Euclid Van der Pol/Clock/Euclid K1": 6.94,
      "/Euclid Van der Pol/Clock/E2 Ratio": 1.9,
      "/Euclid Van der Pol/Clock/E2 Shift": 0.06999999999999995,
      "/Euclid Van der Pol/Clock/Euclid K2": 5.23,
      "/Euclid Van der Pol/Clock/RngData": 0.4,
      "/Euclid Van der Pol/Clock/LFN": 0.3
    },
    "mods": {
      "/Euclid Van der Pol/Clock/Clock": {
        "source": "mclk",
        "amount": 0.25793675052462023
      },
      "/Euclid Van der Pol/Clock/Euclid N": {
        "source": "rng",
        "amount": -0.43408731776312387
      },
      "/Euclid Van der Pol/Clock/Euclid K1": {
        "source": "lfn",
        "amount": 0.08097841660508318
      },
      "/Euclid Van der Pol/Clock/E2 Ratio": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Clock/E2 Shift": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Clock/Euclid K2": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Clock/RngData": {
        "source": "rng",
        "amount": -0.22365530001868544
      },
      "/Euclid Van der Pol/Clock/LFN": {
        "source": "lfn",
        "amount": 0.645188952336461
      }
    },
    "scopes": [
      "lfn",
      "e1",
      "rng"
    ]
  },
  "synth": {
    "code": "import(\"stdfaust.lib\");\n\nui(x) = tgroup(\"Euclid Van der Pol\", x);\n\nuio1(x) = ui(hgroup(\"[2]Osc 1\", x));\nuio2(x) = ui(hgroup(\"[3]Osc 2\", x));\nuio3(x) = ui(hgroup(\"[4]Osc 3\", x));\n\nquant = qu.quantize(55, qu.mixo);\n\n// Forced Van der Pol oscillator\nfvdp = trig : resonator <: dry, wet : interprod with {\n  trig = vslider(\"[0]Trig\", 0, 0, 1, 0.1) : >(0);\n  dry = _ : *(uiDrive) : ma.tanh;\n  wet = _ : (loop ~ (_,_)) : par(i, 2, out) : spread;  \n  \n  // driving source\n  resonator(trig) = trig : pm.strike(0.2, 0.2, 0.5) : fi.nlf2(uiFreq, 1 - 1/uiQ) : _,!;\n\n  // signal conditioning block\n  // (saturation with variable limit) -> (dc blocker with variable frequency)\n  sblock(x) = x : /(uiLim) : ma.tanh : *(uiLim) : fi.highpass(1, uiHP);\n\n  loop(x, y, osc) = sblock(x1), sblock(y1) with {\n    x1 = x + uiDt * y;\n    y1 = y + uiDt * (uiEps * y * (1 - x^2) - x + uiForce * osc);\n  };\n\n  out = /(uiLim) : *(uiDrive) : ma.tanh;\n\n  spread(x, y) = x, y : si.interpolate(uiSpread);\n\n  // 3-way mixer, interpolates between 3 signals based on a [0..1] value\n  mix3(v, x, y, z) = gX * x + gY * y + gZ * z with {\n      gX = ba.listInterp((1, 0, 0), v * 2);\n      gY = ba.listInterp((0, 1, 0), v * 2);\n      gZ = ba.listInterp((0, 0, 1), v * 2);\n  };\n\n  // interpolate between two signals through their product\n  interprod(a, b) = mix3(uiDryWet, a, a*b, b);\n  \n  uiFreq = vslider(\"[1]Freq [unit:Hz] [scale:log]\", 55, 0.1, 16000, 0.01) : quant : si.smoo;\n  uiQ = vslider(\"[2]Q\", 14, 1.1, 20, 0.01) : ^(4) : si.smoo;\n\n  uiForce = vslider(\"[3]Force\", 0.5, 0.001, 1, 0.01) : ^(2) : *(100) : si.smoo;\n  uiEps = vslider(\"[4]Feedback\", 0.1, 0, 1, 0.00001) : ^(2) : *(50) : si.smoo;\n  uiDt = vslider(\"[5]dt\", 1, 0.1, 20, 0.001) : /(50) : si.smoo;\n  uiLim = vslider(\"[6]Limit\",  0.1, 0.0001, 1, .000001) : ^(2) : *(100) : si.smoo;\n  uiHP = vslider(\"[7]DC Block [scale:log]\", 10, 0.5, 220, 0.001) : si.smoo;\n  \n  uiSpread = vslider(\"[81]Spread\", 0.42, 0, 1, 0.01) : si.smoo;\n  uiDryWet = vslider(\"[82]DistAmt\", 0.21, 0, 1, 0.01) : si.smoo;\n  \n  uiDrive = vslider(\"[90]Drive\", 0.3, 0, 1, 0.001) : ^(4) : *(11) : si.smoo;\n};\n\nprocess = uio1(fvdp), uio2(fvdp) <: ui(dm.zita_light) : _,_;\n",
    "params": {
      "/Euclid Van der Pol/Osc 1/Trig": 0,
      "/Euclid Van der Pol/Osc 2/Trig": 0,
      "/Euclid Van der Pol/Zita Light/Dry/Wet Mix": -0.18000000000000005,
      "/Euclid Van der Pol/Osc 1/Freq": 439.42421732244685,
      "/Euclid Van der Pol/Osc 2/Freq": 241.36705346180662,
      "/Euclid Van der Pol/Zita Light/Level": 0.4000000000000057,
      "/Euclid Van der Pol/Osc 1/Q": 13.952,
      "/Euclid Van der Pol/Osc 2/Q": 12.817999999999998,
      "/Euclid Van der Pol/Osc 1/Force": 0.61039,
      "/Euclid Van der Pol/Osc 2/Force": 0.38062,
      "/Euclid Van der Pol/Osc 1/Feedback": 0.54,
      "/Euclid Van der Pol/Osc 2/Feedback": 0.23,
      "/Euclid Van der Pol/Osc 1/dt": 2.09,
      "/Euclid Van der Pol/Osc 2/dt": 1.692,
      "/Euclid Van der Pol/Osc 1/Limit": 0.230077,
      "/Euclid Van der Pol/Osc 2/Limit": 0.30007,
      "/Euclid Van der Pol/Osc 1/DC Block": 37.654891854787365,
      "/Euclid Van der Pol/Osc 2/DC Block": 14.21899745234768,
      "/Euclid Van der Pol/Osc 1/Spread": 0.59,
      "/Euclid Van der Pol/Osc 2/Spread": 0.62,
      "/Euclid Van der Pol/Osc 1/DistAmt": 0.42,
      "/Euclid Van der Pol/Osc 2/DistAmt": 0.43,
      "/Euclid Van der Pol/Osc 1/Drive": 0.61,
      "/Euclid Van der Pol/Osc 2/Drive": 0.67
    },
    "mods": {
      "/Euclid Van der Pol/Osc 1/Trig": {
        "source": "e1",
        "amount": 0.9523746329242909
      },
      "/Euclid Van der Pol/Osc 2/Trig": {
        "source": "e2",
        "amount": 0.754586422085874
      },
      "/Euclid Van der Pol/Zita Light/Dry/Wet Mix": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 1/Freq": {
        "source": "rng",
        "amount": 0.04559208875514457
      },
      "/Euclid Van der Pol/Osc 2/Freq": {
        "source": "rng",
        "amount": -0.0071180761422647695
      },
      "/Euclid Van der Pol/Zita Light/Level": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 1/Q": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 2/Q": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 1/Force": {
        "source": "lfn",
        "amount": 0.30282116994428404
      },
      "/Euclid Van der Pol/Osc 2/Force": {
        "source": "lfn",
        "amount": 0.4994591354239601
      },
      "/Euclid Van der Pol/Osc 1/Feedback": {
        "source": "lfn",
        "amount": -0.04562662381640804
      },
      "/Euclid Van der Pol/Osc 2/Feedback": {
        "source": "rng",
        "amount": 0.05559490815793679
      },
      "/Euclid Van der Pol/Osc 1/dt": {
        "source": "mclk",
        "amount": -0.0046842245845408045
      },
      "/Euclid Van der Pol/Osc 2/dt": {
        "source": "-",
        "amount": -0.04752451579697795
      },
      "/Euclid Van der Pol/Osc 1/Limit": {
        "source": "mclk",
        "amount": 0.032268338117971
      },
      "/Euclid Van der Pol/Osc 2/Limit": {
        "source": "rng",
        "amount": -0.4119822993461595
      },
      "/Euclid Van der Pol/Osc 1/DC Block": {
        "source": "lfn",
        "amount": 0.4899054200912691
      },
      "/Euclid Van der Pol/Osc 2/DC Block": {
        "source": "e2",
        "amount": 0.0016646893965798543
      },
      "/Euclid Van der Pol/Osc 1/Spread": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 2/Spread": {
        "source": "-",
        "amount": -0.43069330369996994
      },
      "/Euclid Van der Pol/Osc 1/DistAmt": {
        "source": "lfn",
        "amount": -0.5127326674435443
      },
      "/Euclid Van der Pol/Osc 2/DistAmt": {
        "source": "-",
        "amount": 0.025809081249790984
      },
      "/Euclid Van der Pol/Osc 1/Drive": {
        "source": "-",
        "amount": 0
      },
      "/Euclid Van der Pol/Osc 2/Drive": {
        "source": "-",
        "amount": 0
      }
    }
  }
};
