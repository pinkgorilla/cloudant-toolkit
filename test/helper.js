exports.test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}

function getSkillSet() {
    var skills = ["node.js", ".net", "javascript", "NoSQL", "SQL", "html", "css"];
    var skillCount = parseInt((2 + Math.random() * (skills.length - 3)).toString());
    var skillSet = [];
    for (var i = 0; i < skillCount; i++) {
        var skillIndex = parseInt((Math.random() * (skills.length - 1)).toString());
        skillSet.push({
            name: skills[skillIndex],
            grade: parseInt((3 + (Math.random() * 7)).toString())
        })
    }
    return skillSet;
}

exports.newData = function () {
    var stamp = Date.now() / 1000 | 0;
    return {
        code: stamp.toString(36),
        name: 'Name-' + stamp,
        date: new Date(),
        age: parseInt((17 + Math.random() * 28).toString()),
        skills: getSkillSet()
    }
}