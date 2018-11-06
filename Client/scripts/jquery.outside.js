(function($){
   $.fn.outside = function(ename, cb){ // Definiere outside Event
      return this.each(function(){
         var $this = $(this),
              self = this;
         $(document.body).on(ename, function tempo(e){
             if(e.target !== self && !$.contains(self, e.target)){
                cb.apply(self, [e]);
                if(self.parentNode) $(document.body).off(ename, tempo);
             }
         });
      });
   };
}(jQuery));