(function(){
  const learningToggle=document.getElementById('learning-toggle');
  const learningSub=document.getElementById('learning-sub');
  if(learningToggle&&learningSub){
    learningToggle.addEventListener('click',function(){ learningSub.classList.add('open'); });
    document.querySelectorAll('[data-page^="learning-"]').forEach(function(el){el.addEventListener('click',function(){learningSub.classList.add('open');});});
  }
})();
