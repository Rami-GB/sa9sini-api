const express = require('express');
const router = new express.Router();
const Skill = require('../models/skill');
const auth = require('../middlware/auth');


//Add a skill
router.post('/skills',auth,async(req,res)=>{
    const skill = new Skill({
        ...req.body,
        owner : req.user._id
    })
    skill['evaluation'] = 0;
    skill['nbrEvaluations'] = 0;
    try {
        skill.save();
        res.status(201).send(skill);
    } catch (error) {
        res.status(400).send(error);
    } 
})





//get it's own skills

router.get('/skills/me',auth,async(req,res)=>{
//{{url}}/skills/me?sortBy=property:asc||desc
const sort = {}
if(req.query.sortBy){
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] =  parts[1]==="asc" ? 1 : -1;
}

try{
      const skills = await Skill.find({owner : req.user._id}).sort(sort).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))  
      res.send(skills).status(200) 
      }catch (e){
      res.send(e).status(400);
      }

})







//Update a skill by it's id    ...Owner update
router.patch('/skills/me/:id',auth,async(req,res)=>{
    const _id = req.params.id;    //Skill id
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description"]   //skill a discuter "Crédibilité"

    const allowed = updates.every((update)=>allowedUpdates.includes(update))

    if(!allowed){return res.status(400).send({error:'Invalid Updates'})}

    try {
        const skill = await Skill.findOne({_id,owner:req.user._id});
        if(!skill){return res.status(404).send()}
        updates.forEach((update) =>{
            skill[update] = req.body[update]
        });
        await skill.save();
        res.send(skill);
    } catch (error) { 
        res.send(error)
    }
})  

//Delete a skill   ...owner delete
router.delete('/skills/:id',auth,async(req,res)=>{
    const _id = req.params.id;

    try {
        const skill = await Skill.findOneAndDelete({_id,owner:req.user._id});
        if(!skill){return res.status(404).send()};
        res.send(skill)
    } catch (error) {
        res.status(500).send()
    }
})






//--------------------------------------------------------------------------
//A modifier
//Evaluate a skill 
router.patch('/skills/:id',auth,async(req,res)=>{
    const _id = req.params.id;

    try {
        const skill  = await Skill.findOne({_id});
      
        if(!skill){return res.status(404).send()}
        if(req.user._id.equals(skill.owner)){res.status(403).send("invalid evaluation")};
        let exist = skill.raters.filter((el)=>{
            return el.rater.equals(req.user._id);
        })
        if(!exist.length){
            console.log("new rate")
            skill.raters.push({rater:req.user._id,rate:req.body.evaluation})}
        else{
            console.log(req.body.evaluation)
            for(let i=0 ; i<skill.raters.length;i++){
                if(skill.raters[i].rater.equals(req.user._id)){
                    skill.raters[i].rate = req.body.evaluation;
                }
            }
        }
        
        let moyen = 0;
        for(let i=0 ; i<skill.raters.length;i++){
                moyen += skill.raters[i].rate;
            }

            skill.evaluation = moyen / (skill.raters.length)

        await skill.save();
        res.send(skill)
    } catch(error){  
        res.status(500).send()     
    }
})


//--------------------------------------------------------------------------





 

//Search of skill by name;
router.get('/skills/:skill',auth,async(req,res)=>{
try {


    const sorted={}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        console.log(parts)
        sorted[parts[0]] = parts[1]==="asc" ? 1 : -1;
    }


    const skills=await Skill.find({
        skill:req.params.skill
    }).limit(parseInt(req.query.limit)).sort(sorted)
    
    if(!skills){res.status(404).send()}
    res.send(skills)
} catch (error) {
    res.status(500).send(error)
}
})






module.exports = router;