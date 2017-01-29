var app = {};

var INFO = {
  people: {
    men: null,
    women: null,
    kids: null
  },
  drinks: [],
  // количество потребления алкоголя
  alko:null
};

var NON_ALKO = ['drinks_soda', 'drinks_water', 'drinks_juice'];
var FOOD_TYPES = {
  cold_snacks: 'Холодные закуски',
  hot_snacks: 'Горячие закуски',
  salads: 'Салаты',
  hot_dishes: 'Горячие блюда',
  garnish: 'Гарнир',
  fruits: 'Фрукты'
};

$(document).ready(function(){
  var tab_type = 'tab_1';

  /* СНИМЕМ ДЕФОЛТНЫЕ ПАРАМЕТРЫ */
  app.get = function( type ){
    var types = {
      men: function(){
        return $('#men').val()
      },
      women: function(){
        return $('#women').val()
      },
      kids: function(){
        var val = $('#kids').val() < 0 ? 0 : $('#kids').val();

        return $('#kids').val()
      },
      drinks: function(){
        var output = [];
        $('input[name="drinks"]').each(function( ){
          if( $(this).prop('checked') ){
            output.push( $(this).val() );
          }
        });

        return output;
      },

      area_spec: function(){
        var output = [];
        $('input[name="area_spec"]').each(function( ){
          if( $(this).prop('checked') ){
            output.push( $(this).val() );
          }
        });

        return output;
      },
      alko: function(){
        console.log( $('input[name="alko"]:checked').val() );
        return $('input[name="alko"]:checked').val();
      },
      banket_type: function(){
        return $('input[name="banket_type"]:checked').val();
      },
      sitting: function(){
        return $('input[name="sitting_type"]:checked').val();
      }
    };

    if(types.hasOwnProperty( type )){
      return types[ type ]();
    }else{
      throw new Error('Wring drink type: ' + type)
    }

  };

  $('.js-calc-all-button').on('click', function(){
    console.log('clicked');
    calcInfo();
  });

  //слушаем изменения в чекбоксах
  $('.js-unique-app-control').on('change', function(){
    calcInfo();
  });

  //слушаем ENTER в инпутах
   $('.js-app-input').on('keydown', function( e ){
     var key_code = e.keyCode;

     if( key_code === 13){
       calcInfo();
     }
   });

   function calcInfo(){
       var preloader = $('.js-preloader');
       preloader.removeClass('hidden');

     $('body').removeClass('body__first-time');

       setTimeout(function(){
         preloader.addClass('hidden');
         app.calcDrinks();
         app.calcFoods();
         app.calcArea();
         app.calcStaff();

       }, 800)
   };

   $('.js-tab-item').on('click', function( e ){
     var target = $(e.currentTarget);
     //прости Господи
     $('.active').removeClass('active');

     target.addClass('active');

     tab_type = target.attr('id');

     showTabContent( tab_type );
   });

   function showTabContent( tab_type ){
     $('.js-tab-content-item').each(function(){
       var type = $(this).data('type');

       if( type===tab_type){
         $(this).removeClass('hidden');
       }else{
         $(this).addClass('hidden');
       }
     });
   }
   /* РАБОТА С ТАБАМИ */


});

app.calcDrinks = function(){
  // debugger;
  var rows = $('.js-drink-row'),
      available_drinks = app.get('drinks'),
      alko = app.get('alko'),
      men = isNaN( parseInt( app.get('men')) ) ? 0 : parseInt( app.get('men')),
      women = isNaN( parseInt( app.get('women')) ) ? 0 : parseInt( app.get('women')),
      kids = isNaN( parseInt( app.get('kids')) ) ? 0 : parseInt( app.get('kids')),
      drink_type, drink_info;

  rows.each(function(){
    drink_type = $(this).data('drink');
    drink_info = calcDrink( alko, drink_type );


    if( available_drinks.indexOf(drink_type) > -1 || NON_ALKO.indexOf(drink_type) > -1 ){
      /*debugger;*/
      var summ_liters = drink_info.info.men*men + drink_info.info.women*women + drink_info.info.kids*kids,
          kids_summ = drink_info.info.kids === 0 ? 0 : kids;


      $(this).find('.js-liters').html( Math.round( summ_liters*100) / 100 );
      $(this).find('.js-grammes').html( Math.round( summ_liters/(men + women + kids_summ)*1000*100) / 100);
      $(this).find('.js-bottles').html( Math.round( summ_liters/drink_info.bottle_index*100) / 100 );
    }else{
      $(this).find('.js-liters').html('-');
      $(this).find('.js-bottles').html( '-' );
      $(this).find('.js-grammes').html( '-');
    }
  });
};
app.calcFoods = function(){
  var type = app.get('banket_type'),
      men = isNaN( parseInt( app.get('men')) ) ? 0 : parseInt( app.get('men')),
      women = isNaN( parseInt( app.get('women')) ) ? 0 : parseInt( app.get('women')),
      kids = isNaN( parseInt( app.get('kids')) ) ? 0 : parseInt( app.get('kids')),
      $table = $('.js-food-table'),
      calc_food = calcFood( type ),
      food = calc_food.food,
      food_types = calc_food.types,
      // для детей порция составляет 75% от взрослой
      summ = men + women + kids*0.75,
      cake_index = {optimum: 150, max: 200};

  var row_tmpl = '<tr class="js-specific-row"><td><span class="table__bold table__bold_small">%title%</span></td><td><span>%min%</span></td><td><span>%kid_min%</span></td><td><span>%optimum%</span></td><td><span>%kid_optimum%</span></td><td><span>%max%</span></td><td><span>%kid_max%</span></td></tr>';

  console.log( food_types );
  // сперва удалим преддущие строки с хавкой
  $('.js-specific-row').detach();

  food_types.forEach(function( item ){
    // каждому айтему отрисыем строку
    $('.js-cake-row').before(
        row_tmpl
          .replace('%title%', FOOD_TYPES[item.type])
          .replace('%min%', item.percentage / 100 * food.min)
            .replace('%kid_min%', item.percentage / 100 * food.min*.75)
            .replace('%optimum%', item.percentage / 100 * food.optimum)
            .replace('%kid_optimum%', item.percentage / 100 * food.optimum*.75)
            .replace('%max%', item.percentage / 100 * food.max)
            .replace('%kid_max%', item.percentage / 100 * food.max*.75)
    )
  });

  $table.find('.js-food-min').html(food.min);
  $table.find('.js-food-kid-min').html(food.min * 0.75);
  $table.find('.js-food-optimum').html(food.optimum);
  $table.find('.js-food-kid-optimum').html(food.optimum * 0.75);
  $table.find('.js-food-max').html(food.max);
  $table.find('.js-food-kid-max').html(food.max * 0.75);

  $table.find('.js-cake-optimum').html(cake_index.optimum);
  $table.find('.js-cake-max').html(cake_index.max);
  $table.find('.js-cake-kid-optimum').html(cake_index.optimum*0.75);
  $table.find('.js-cake-kid-max').html(cake_index.max*0.75);

};
app.calcArea = function(){
  // debugger;
  var type = app.get('banket_type'),
      spec = app.get('area_spec'),

      men = isNaN( parseInt( app.get('men')) ) ? 0 : parseInt( app.get('men')),
      women = isNaN( parseInt( app.get('women')) ) ? 0 : parseInt( app.get('women')),
      kids = isNaN( parseInt( app.get('kids')) ) ? 0 : parseInt( app.get('kids')),

      summ = men + women + kids,
      $table = $('.js-place-table'),
      $base = $table.find('.js-base-area'),
      $toilet = $table.find('.js-toilets'),
      area = calcArea( type ),

      min = 0, optimum = 0,
      min_summ = 0, optimum_summ = 0;

  var spec_types = {
    area_2: {
      min:30,
      optimum: 30
    },
    area_3: {
      min:45,
      optimum: 45
    },
    area_4: {
      min:20,
      optimum: 20
    }
  };

  // базовая площадь
  if(spec.indexOf('area_1') > -1 ){
    min += 1;
    min_summ = min*summ;
    optimum += 1.2;
    optimum_summ = optimum*summ;
  }

  min += area.min;
  min_summ = min *summ;
  optimum += area.optimum;
  optimum_summ = optimum *summ;

  $table.find('.js-place-table-row').each(function(){
    $(this).find('.place-min').html('-');
    $(this).find('.place-optimum').html('-');
  });

  $toilet.find('.place-min').html( Math.ceil(summ/60) );
  $toilet.find('.place-optimum').html( Math.ceil(summ/50));

  $base.find('.place-min').html( Math.ceil(min_summ) );
  $base.find('.place-optimum').html( Math.ceil(optimum_summ) );

  for(var i = 0; i < spec.length; i++ ){
    if( $table.find('.js-place-table-row [data-place-row="' + spec[i] + '"]' ) && spec_types.hasOwnProperty(spec[i]) ){

      $table.find('.js-place-table-row[data-place-row="' + spec[i] + '"]' ).find('.place-min').html( Math.ceil( spec_types[spec[i]]['min']) );
      $table.find('.js-place-table-row[data-place-row="' + spec[i] + '"]' ).find('.place-optimum').html( Math.ceil( spec_types[spec[i]]['optimum']) );
      min_summ += spec_types[spec[i]]['min'];
      optimum_summ += spec_types[spec[i]]['optimum'];
    }else if($table.find('.js-place-table-row [data-place-row="' + spec[i] + '"]' )){
      $table.find('.js-place-table-row[data-place-row="' + spec[i] + '"]' ).find('.place-min').html('-');
      $table.find('.js-place-table-row[data-place-row="' + spec[i] + '"]' ).find('.place-optimum').html('-');
    }
  }

  $table.find('[data-place-row="summ"]' ).find('.place-optimum').html( Math.ceil(optimum_summ));
  $table.find('[data-place-row="summ"]' ).find('.place-min').html( Math.ceil(min_summ));


};
app.calcStaff = function(){
   // debugger;
  var type = app.get('banket_type'),
      area_spec = app.get('area_spec'),
      staff_info = calcStaff( type ),
      men = isNaN( parseInt( app.get('men')) ) ? 0 : parseInt( app.get('men')),
      women = isNaN( parseInt( app.get('women')) ) ? 0 : parseInt( app.get('women')),
      kids = isNaN( parseInt( app.get('kids')) ) ? 0 : parseInt( app.get('kids')),
      summ = men + women + kids,
      $table = $('.js-staff-table'),
      $waiter_row = $table.find('.js-staff-waiter'),
      $barman_row = $table.find('.js-staff-barman'),
      $garderob_row = $table.find('.js-staff-garderob');

  $waiter_row.find('.js-min').html(Math.round(summ/staff_info.min));
  console.log( summ/staff_info.min );
  $waiter_row.find('.js-optimum').html(Math.round(summ/staff_info.optimum));
  console.log( summ/staff_info.optimum );


  $garderob_row.find('.js-min').html(Math.round(summ/70));
  $garderob_row.find('.js-optimum').html(Math.round(summ/50));

  if(area_spec.indexOf('area_3') > -1){
    $barman_row.find('.js-min').html(Math.round(summ/staff_info.min) + Math.round(summ/60));
    $barman_row.find('.js-optimum').html(Math.round(summ/staff_info.min) + Math.round(summ/40));
  }else{
    $barman_row.find('.js-min').html('-');
    $barman_row.find('.js-optimum').html('-');
  }


};
var calcDrink = function( alko, drink ){
  /* в литрах  */
  var match = {
    drinks_wine_white: {
      few:{
        men:0.35,
        women: 0.7,
        kids:0
      },
      middle:{
        men:0.7,
        women: 0.7,
        kids:0
      },
      alot:{
        men:0.7,
        women: 1.4,
        kids:0
      },
      bottle_index: 0.7
    },
    drinks_wine_red: {
      few:{
        men:0.35,
        women: 0.7,
        kids:0
      },
      middle:{
        men:0.7,
        women: 0.7,
        kids:0
      },
      alot:{
        men:0.7,
        women: 1.4,
        kids:0
      },
      bottle_index: 0.7
    },
    drinks_hard: {
      few:{
        men:0.25,
        women: 0,
        kids:0
      },
      middle:{
        men:0.5,
        women: 0.15,
        kids:0
      },
      alot:{
        men:0.75,
        women: 0.25,
        kids:0
      },
      bottle_index: 0.5
    },
    drinks_brut: {
      few:{
        men:0.21,
        women: 0.21,
        kids:0
      },
      middle:{
        men:0.35,
        women: 0.35,
        kids:0.35
      },
      alot:{
        men:0.35,
        women: 0.7,
        kids:0.35
      },
      bottle_index: 0.75
    },
    drinks_soda:{
      few:{
        men:0.5,
        women: 0.5,
        kids:1
      },
      middle:{
        men:1,
        women: 1,
        kids:1
      },
      alot:{
        men:1,
        women: 1,
        kids:1
      },
      bottle_index: 2
    },
    drinks_juice:{
      few:{
        men:0.5,
        women: 0.5,
        kids:0.5
      },
      middle:{
        men:0.5,
        women: 0.5,
        kids:0.5
      },
      alot:{
        men:1,
        women: 0.5,
        kids:0.5
      },
      bottle_index: 1
    },
    drinks_water:{
      few:{
        men:0.5,
        women: 0.5,
        kids:0
      },
      middle:{
        men:0.5,
        women: 0.5,
        kids:0.5
      },
      alot:{
        men:0.5,
        women: 0.5,
        kids:0
      },
      bottle_index: 1.5
    }
  };

  return {info: match[drink][alko], bottle_index: match[drink]['bottle_index']};
};
var calcFood = function(event_type){
  var match = {
    banket_1:{
      food:{
        min: 700,
        optimum: 1100,
        max: 1500,
      },
      types: [
        {
          type:'cold_snacks',
          percentage:25
        },
        {
          type:'hot_snacks',
          percentage:10
        },
        {
          type:'salads',
          percentage:20
        },
        {
          type:'hot_dishes',
          percentage:20
        },
        {
          type:'garnish',
          percentage:10
        },
        {
          type:'fruits',
          percentage:15
        }
      ]
    },
    banket_2:{
      food:{
        min: 700,
        optimum: 1100,
        max: 1500,
      },
      types: [
        {
          type:'cold_snacks',
          percentage:25
        },
        {
          type:'hot_snacks',
          percentage:10
        },
        {
          type:'salads',
          percentage:20
        },
        {
          type:'hot_dishes',
          percentage:20
        },
        {
          type:'garnish',
          percentage:10
        },
        {
          type:'fruits',
          percentage:15
        }
      ]
    },
    banket_3:{
      food:{
        min: 700,
        optimum: 800,
        max: 1200,
      },
      types: [
        {
          type:'cold_snacks',
          percentage:30
        },
        {
          type:'hot_snacks',
          percentage:30
        },
        {
          type:'hot_dishes',
          percentage:20
        },
        {
          type:'fruits',
          percentage:20
        }
      ]
    },
    banket_4:{
      food:{
        min: 400,
        optimum: 500,
        max: 700,
      },
      types: [
        {
          type:'cold_snacks',
          percentage:30
        },
        {
          type:'hot_snacks',
          percentage:30
        },
        {
          type:'hot_dishes',
          percentage:20
        },
        {
          type:'fruits',
          percentage:20
        }
      ]
    },
    banket_5:{
      food:{
        min: 500,
        optimum: 700,
        max: 900
      },
      types: [
        {
          type:'cold_snacks',
          percentage:40
        },
        {
          type:'hot_snacks',
          percentage:20
        },
        {
          type:'salads',
          percentage:20
        },
        {
          type:'fruits',
          percentage:20
        }
      ]
    }
  };
  return match[event_type];
};
var calcArea = function(event_type){
  var sitting = app.get('sitting');

  var match = {
    banket_1:{
      min: sitting === 'sitting_1' ? 2.3 : 2.8,
      optimum: sitting === 'sitting_1' ? 2.5 : 3
    },
    banket_2:{
      min: sitting === 'sitting_1' ? 2.3 : 2.8,
      optimum: sitting === 'sitting_1' ? 2.5 : 3
    },
    banket_3:{
      min: 2.3,
      optimum: 2.5
    },
    banket_4:{
      min: 1.5,
      optimum: 1.7
    },
    banket_5:{
      min: 1.5,
      optimum: 1.7
    }
  };
  return match[event_type];
};
var calcStaff = function(event_type){

  var match = {
    banket_1:{
      min: 10,
      optimum: 6
    },
    banket_2:{
      min: 12,
      optimum: 10
    },
    banket_3:{
      min: 15,
      optimum: 12
    },
    banket_4:{
      min: 20,
      optimum: 15
    },
    banket_5:{
      min: 20,
      optimum: 15
    }
  };
  return match[event_type];
};/**
 * Created by alekseyrudenko on 26.01.17.
 */
