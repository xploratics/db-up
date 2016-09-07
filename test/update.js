var expect = require('chai').expect;
var update = require('../').update;
var path = './test/patches';

describe('update', function () {
    it('should run updates in correct orders', function () {
        var data = [];
        return update({ data, path }).then(_ => expect(data).to.eql([1, 2, 10]));
    });

    it('should run updates after a specific version', function () {
        var data = [];
        return update({ data, path, version: 2 }).then(_ => expect(data).to.eql([10]));
    });

    it('should not crash if nothing to apply', function () {
        var data = [];
        return update({ data, path, version: 10 }).then(_ => expect(data).to.eql([]));
    });

    it('should call onApplyingPatch and onAppliedPatch', function () {
        var appliedCount = 0;
        var applyingCount = 0;

        var args = {
            data: [],
            path,
            onAppliedPatch: _ => appliedCount++,
            onApplyingPatch: _ => applyingCount++
        };

        return update(args)
            .then(function (e) {
                expect(appliedCount).to.equal(3);
                expect(applyingCount).to.equal(3);
                return e;
            });
    });

    it('should return the list of applied patches with their results', function () {
        var data = [];
        return update({ data, path }).then(function (array) {

            // remove filenames from the comparison
            for (var i = 0; i < array.length; i++)
                delete array[i].patch.filename;

            expect(array).to.eql([
                { patch: { id: 1 }, result: 1 },
                { patch: { id: 2 }, result: 2 },
                { patch: { id: 10 }, result: 10 }
            ]);
        });
    });
});