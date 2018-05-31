var Diaporama = {
    /*--point de départ du diaporama ( diapo courant )--*/
    repereCourant: 0,

    init: function () {
        /*--Je veux un diaporama automatique--*/
        Diaporama.diapoAuto();

        /*--Je veux pouvoir lancer le diaporama en cliquant sur un bouton--*/
        Diaporama.lectureAutoOnClick();

        /*--Je veux pouvoir aller à la diapo suivante en cliquant sur un bouton--*/
        Diaporama.suivantDiapoOnClick();

        /*--Je veux pouvoir aller à la diapo précédente en cliquant sur un bouton--*/
        Diaporama.precedentDiapoOnClick();

        /*--Je veux pouvoir aller à la diapo suivante ou précédente en appuyant sur une touche du clavier ordinateur--*/
        Diaporama.zapperDiapoOnKeypress();
    },

    /*--affiche la diapo courante--*/
    activeDiapo: function () {
        var diapos = $('.fade');
        var diapo = diapos.eq(Diaporama.repereCourant);
        diapos.hide();
        diapo.css('display', 'flex');
    },

    /*--affiche la diapo suivante--*/
    reperePlus: function () {
        var diapos = $('.fade');
        var diaposNumber = diapos.length;
        Diaporama.repereCourant += 1;
        if (Diaporama.repereCourant > diaposNumber - 1) {
            Diaporama.repereCourant = 0;
        }
    },

    /*--affiche la diapo précédente--*/
    repereMoins: function () {
        var diapos = $('.fade');
        var diaposNumber = diapos.length;
        Diaporama.repereCourant -= 1;
        if (Diaporama.repereCourant < 0) {
            Diaporama.repereCourant = diaposNumber - 1;
        }
    },

    /*--Contrôles play et stop--*/
    diapoAuto: function () {
        var play = $('.play');
        play.click(function () {
            var timer = setInterval(function () {
                Diaporama.reperePlus();
                Diaporama.activeDiapo();
            }, 7000);
            var stop = $('.stop');
            stop.click(function () {
                clearInterval(timer);
            });
        });
    },


    /*-- au clique play, charge le diaporama --*/
    lectureAutoOnClick: function () {
        var play = $('.play');
        play.trigger('click');
    },

    /*-- au clique ">>", charge la diapo suivante--*/
    suivantDiapoOnClick: function () {
        var next = $('.next');
        next.click(function () {
            Diaporama.reperePlus();
            Diaporama.activeDiapo();
        });
    },

    /*-- au clique "<<", charge la diapo précédente--*/
    precedentDiapoOnClick: function () {
        var prev = $('.prev');
        prev.click(function () {
            Diaporama.repereMoins();
            Diaporama.activeDiapo();
        });
    },

    /*-- précédent ou suivant avec les touches du clavier --*/
    zapperDiapoOnKeypress: function () {
        $('body').keydown(function (e) {
            if (e.which === 39) {
                Diaporama.reperePlus();
                Diaporama.activeDiapo();
            } else if (e.which === 37) {
                Diaporama.repereMoins();
                Diaporama.activeDiapo();
            }
        })
    },
}


$(function () {
    Diaporama.init();
});