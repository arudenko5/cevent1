
/* NUMERIC INPUT*/

$('.js-numeric-input')
    .keydown(function (e) {
      // Allow: backspace, delete, tab, escape, enter and .
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
          // Allow: Ctrl+A, Command+A
          (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
          // Allow: home, end, left, right, down, up
          (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    })
    .blur(function(){
      var  t = $(this);
      if( t.val() === '' || isNaN( parseInt( t.val() ) )){
        t.val( 0 );
      }
    });

/*  СВОРАЧИВАНИЕ БЛОКОВ */
(function( document, window, $ ){
  $(document).ready(function(){
    $('.form__row--togglable').on('click', function( e ){
      $(this).toggleClass('expanded');
    });

    $('.calc-block').on('click', function( e ){
      e.stopPropagation();
    });
  });
})(document, window, $);

/*  СЛУШАЕМ ИЗМЕНЕНИЯ  */
(function( document, window, $ ){
  $(document).ready(function(){
    /* ВО ВРЕМЯ ЗАГРУЗКИ ПРОХОДИМСЯ ПО БЛОКАМ  */

    /*   СЛУШАЕМ ИЗМЕНЕНИЯ */
    $('.calc-block input[type="checkbox"], .calc-block input[type="radio"] ')
        .on('change', function(){
          superChanges( $(this).parents('.form__row'));
        });
  });

  function superChanges( $block ){
    var text = '',
        info_block = $block.find('.form__text-holder');
    // проходим
    $block.find('input[type="checkbox"], input[type="radio"] ').each(function(){
      if( $(this).prop('checked') ){
        text += $('label[for="' + $(this).attr('id') + '"]').text() + ' <br/>';
      }
    });

    if( text !== ''){
      info_block.html( text );
    }else{
      info_block.html( info_block.data('title') + ': не выбрано')
    }
  }
})(document, window, $);
