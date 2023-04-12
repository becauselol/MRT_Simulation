const StatCompact = require('./index');

describe("StatCompact", () => {

    describe("Simple Test", () => {
      test('median should be 4', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 7; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.getMedian()).toBe(4)
        expect(testCompact.getSum()).toBe(28)
        expect(testCompact.getMean()).toBe(4)
        
        expect(testCompact.getStd()).toBeCloseTo(2.1602468994693, 6)
      })

      test('q25 should be 2', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 7; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q25()).toBe(2)
      })

      test('q75 should be 6', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 7; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q75()).toBe(6)
      })
    })

    describe("Slightly Harder Test", () => {
      test('median should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.getMedian()).toBe(3)
      })

      test('q25 should be 1.5', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q25()).toBe(1.5)
      })

      test('q75 should be 4.5', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q75()).toBe(4.5)
      })
    })

    describe("25 values", () => {
      test('median should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.getMedian()).toBe(3)
      })

      test('q25 should be 2', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.q25()).toBe(2)
      })

      test('q75 should be 4', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.q75()).toBe(4)
      })
    })

    describe("25 values 2", () => {
      test('median should be 6', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i*2);
          }
        }
        expect(testCompact.getMedian()).toBe(6)
      })

      test('q25 should be 4', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i*2);
          }
        }
        expect(testCompact.q25()).toBe(4)
      })

      test('q75 should be 8', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 5; i++) {
          for (var j=1;j <= 5;j++){
            testCompact.addValue(i*2);
          }
        }
        expect(testCompact.q75()).toBe(8)
      })
    })

    describe("10 values", () => {
      test('median should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          for (var j=1;j <= i;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.getMedian()).toBe(3)
      })

      test('q25 should be 2', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          for (var j=1;j <= i;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.q25()).toBe(2)
      })

      test('q75 should be 4', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          for (var j=1;j <= i;j++){
            testCompact.addValue(i);
          }
        }
        expect(testCompact.q75()).toBe(4)
      })
    })

    describe("Even number Harder Test", () => {
      test('median should be 2.5', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.getMedian()).toBe(2.5)
      })

      test('q25 should be 1.5', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q25()).toBe(1.5)
      })

      test('q75 should be 3.5', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 4; i++) {
          testCompact.addValue(i);
        }
        expect(testCompact.q75()).toBe(3.5)
      })
    })

    describe("Boring test", () => {
      test('median should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 20; i++) {
          testCompact.addValue(3);
        }
        expect(testCompact.getMedian()).toBe(3)
      })

      test('q25 should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 20; i++) {
          testCompact.addValue(3);
        }
        expect(testCompact.q25()).toBe(3)
      })

      test('q75 should be 3', () => {
        var testCompact = new StatCompact();
        for (var i=1; i <= 20; i++) {
          testCompact.addValue(3);
        }
        expect(testCompact.q75()).toBe(3)
      })
    })

    describe("Empty test", () => {
      test('all 0s', () => {
        var testCompact = new StatCompact();
        expect(testCompact.getNineFigureArray()).toEqual([0,0,0,0,0,0,0,0,0])
      })
      test('max should be 0', () => {
        var testCompact = new StatCompact();
        expect(testCompact.getMax()).toBe(0)
      })
      test('min should be 0', () => {
        var testCompact = new StatCompact();
        expect(testCompact.getMin()).toBe(0)
      })
      test('median should be 0', () => {
        var testCompact = new StatCompact();
        expect(testCompact.getMedian()).toBe(0)
      })

      test('q25 should be 0', () => {
        var testCompact = new StatCompact();
        expect(testCompact.q25()).toBe(0)
      })

      test('q75 should be 0', () => {
        var testCompact = new StatCompact();
        expect(testCompact.q75()).toBe(0)
      })
    })

    describe("Random test", () => {
      test('median should be 2', () => {
        var testCompact = new StatCompact();
        testCompact.addValue(1);
        testCompact.addValue(3);
        testCompact.addValue(2);
        testCompact.addValue(1);
        testCompact.addValue(3);
        expect(testCompact.getMedian()).toBe(2)
      })

      test('q25 should be 1', () => {
        var testCompact = new StatCompact();
        testCompact.addValue(1);
        testCompact.addValue(3);
        testCompact.addValue(2);
        testCompact.addValue(1);
        testCompact.addValue(3);
        expect(testCompact.q25()).toBe(1)
      })

      test('q75 should be 3', () => {
        var testCompact = new StatCompact();
        testCompact.addValue(1);
        testCompact.addValue(3);
        testCompact.addValue(2);
        testCompact.addValue(1);
        testCompact.addValue(3);
        expect(testCompact.q75()).toBe(3)
      })
    })


});