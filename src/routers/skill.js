const express = require('express');
const router = new express.Router();
const Skill = require('../models/skill');
const User = require('../models/user');
const auth = require('../middlware/auth');

//Add a skill
router.post('/skills', auth, async (req, res) => {
    const skill = new Skill({
        ...req.body,
        owner: {
            _id: req.user._id,
            userName: req.user.userName,
            imgUrl: `/users/${req.user._id}/profilePicture`
        }
    })

    try {
        await skill.save();
        res.status(201).send(skill);
    } catch (error) {
        res.status(400).send(error);
    }
})





//get it's own skills

router.get('/skills/me', auth, async (req, res) => {
    //{{url}}/skills/me?sortBy=property:asc||desc
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
    }

    try {
        const skills = await Skill.find({ 'owner._id': req.user._id })
            .sort(sort)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
        res.send(skills).status(200)
    } catch (e) {
        res.send(e).status(400);
    }

})

router.get('/skills/user/:id', auth, async (req, res) => {
    //{{url}}/skills/me?sortBy=property:asc||desc
    const user = await User.findOne({ _id: req.params.id });
    if (!user) throw new Error();


    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
    }

    try {
        const skills = await Skill.find({ 'owner._id': user._id })
            .sort(sort)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
        res.send(skills).status(200)
    } catch (e) {
        res.send(e).status(400);
    }

})







//Update a skill by it's id    ...Owner update
router.patch('/skills/me/:id', auth, async (req, res) => {
    const _id = req.params.id;    //Skill id
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description"]   //skill a discuter "Crédibilité"

    const allowed = updates.every((update) => allowedUpdates.includes(update))

    if (!allowed) { return res.status(400).send({ error: 'Invalid Updates' }) }

    try {
        const skill = await Skill.findOne({ _id, 'owner._id': req.user._id });

        if (!skill) { return res.status(404).send() }
        updates.forEach((update) => {
            skill[update] = req.body[update]
        });
        await skill.save();
        res.send(skill);
    } catch (error) {
        res.send(error)
    }
})

//Delete a skill   ...owner delete
router.delete('/skills/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const skill = await Skill.findOneAndDelete({ _id, 'owner._id': req.user._id });
        if (!skill) { return res.status(404).send() };
        res.send(skill)
    } catch (error) {
        res.status(500).send()
    }
})






//--------------------------------------------------------------------------
//A modifier
//Evaluate a skill 
router.post('/skills/:id/rate', auth, async (req, res) => {

    try {
        const skill = await Skill.findOne({ _id: req.params.id });
        if (!skill) { return res.status(404).send() }
        if (req.user._id.equals(skill.owner._id)) { return res.status(403).send("invalid evaluation") };
        let exist = skill.raters.filter((el) => {
            return el.rater.equals(req.user._id);
        })

        if (!exist.length) {
            skill.raters.push({ rater: req.user._id, rate: req.body.rate })
        }
        else {
            for (let i = 0; i < skill.raters.length; i++) {
                if (skill.raters[i].rater.equals(req.user._id)) {
                    skill.raters[i].rate = req.body.rate;
                }
            }
        }

        let moyen = 0;
        for (let i = 0; i < skill.raters.length; i++) {
            moyen += skill.raters[i].rate;
        }

        skill.evaluation = moyen / (skill.raters.length)

        await skill.save();
        await skill.populate('raters.rater').execPopulate();
        res.send(skill)
    } catch (error) {
        res.status(500).send()
    }
})


//--------------------------------------------------------------------------







//Search of skill by name;
router.get('/skills/:skill', auth, async (req, res) => {
    try {


        const sorted = {}

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(":")
            console.log(parts)
            sorted[parts[0]] = parts[1] === "asc" ? 1 : -1;
        }


        const skills = await Skill.find({ skill: req.params.skill })
            .limit(parseInt(req.query.limit))
            .sort(sorted)

        if (!skills) { return res.status(404).send() }

        res.send(skills)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})






module.exports = router;