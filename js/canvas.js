var CanvasForSign = {
    /*--Variables pour suivre la position de la souris et l'état du bouton gauche--*/
    mouseX: 0,
    mouseY: 0,
    mouseDown: 0,

    /*--Variables pour garder la trace de la position tactile--*/
    touchX: 0,
    touchY: 0,

    /*--Gardez une trace de la dernière position lors du tracé d'une ligne.
    Fixé à -1 au départ en attendant une bonne valeur--*/
    lastX: -1,
    lastY: -1,

    /*-- Configurer le canevas et ajouter des gestionnaires d'événements après le chargement de la page--*/
    init: function () {
        /*--Récupère l'élément canvas spécifique du document HTML--*/
        ctx = document.getElementById('signature_canvas').getContext('2d');

        document.getElementById('valider').style.display = "none";


        /*--Réagit aux événements de la souris sur la toile, et du up de la souris sur l'ensemble du document--*/
        document.getElementById('signature_canvas').addEventListener('mousedown', CanvasForSign.sketchpad_mouseDown, false);
        document.getElementById('signature_canvas').addEventListener('mousemove', CanvasForSign.sketchpad_mouseMove, false);
        window.addEventListener('mouseup', CanvasForSign.sketchpad_mouseUp, false);

        /*--Réagit au toucher des événements sur la toile--*/
        document.getElementById('signature_canvas').addEventListener('touchstart', CanvasForSign.sketchpad_touchStart, false);
        document.getElementById('signature_canvas').addEventListener('touchend', CanvasForSign.sketchpad_touchEnd, false);
        document.getElementById('signature_canvas').addEventListener('touchmove', CanvasForSign.sketchpad_touchMove, false);

        /*--Réinitialise le canevas en cliquant "Effacer"--*/
        document.getElementById('effacer').addEventListener('click', function () {
            ctx.clearRect(0, 0, document.getElementById('signature_canvas').width, document.getElementById('signature_canvas').height);
            document.getElementById('valider').style.display = "none";
        });
        
        /*--Réinitialise le canevas lorsque l'on clique sur un autre icône vélo de la carte lors d'une réservation déjà en cours--*/
        document.getElementById('map').addEventListener('click', function () {
            ctx.clearRect(0, 0, document.getElementById('signature_canvas').width, document.getElementById('signature_canvas').height);
            document.getElementById('valider').style.display = "none";
        });
        
    },

    /*--Dessine une ligne entre la position spécifiée sur le nom de la toile fournie.Les paramètres sont: Un contexte de canevas, la position x, la position y, la taille du point--*/
    drawLine: function (ctx, x, y, size) {

        /*--Si lastX n'est pas défini, définition de lastX et lastY sur la position actuelle--*/
        if (CanvasForSign.lastX == -1) {
            CanvasForSign.lastX = x;
            CanvasForSign.lastY = y;
        }

        /*--Sélection d'un style de remplissage--*/
        ctx.strokeStyle = "#45505b";

        /*--Définit le style "cap" de la ligne pour arrondir, afin que les lignes à différents angles puissent se joindre les unes aux autres--*/
        ctx.lineCap = "round";
        //ctx.lineJoin = "round";


        /*--Dessine une ligne pleine--*/
        ctx.beginPath();

        /*--D'abord, passe à l'ancienne position (précédente)--*/
        ctx.moveTo(CanvasForSign.lastX, CanvasForSign.lastY);

        /*--Dessine ensuite une ligne jusqu'à la position actuelle du pointeur / pointeur--*/
        ctx.lineTo(x, y);

        /*--Définit l'épaisseur de la ligne et dessine la ligne--*/
        ctx.lineWidth = size;
        ctx.stroke();

        ctx.closePath();

        /*--Met à jour la dernière position pour référencer la position actuelle--*/
        CanvasForSign.lastX = x;
        CanvasForSign.lastY = y;

        document.getElementById('valider').style.display = "block";
    },



    /*--Garde une trace du bouton de la souris pressé et dessine un point à l'emplacement actuel--*/
    sketchpad_mouseDown: function () {
        CanvasForSign.mouseDown = 1;
        CanvasForSign.drawLine(ctx, CanvasForSign.mouseX, CanvasForSign.mouseY, 4);
    },

    /*--Garde une trace du bouton de la souris libéré--*/
    sketchpad_mouseUp: function () {
        CanvasForSign.mouseDown = 0;

        /*--Réinitialise lastX et lastY à -1 pour indiquer qu'ils sont maintenant invalides, au lever du "stylo"--*/
        CanvasForSign.lastX = -1;
        CanvasForSign.lastY = -1;
    },

    /*--Garde une trace de la position de la souris et dessine un point si le bouton de la souris est pressé--*/
    sketchpad_mouseMove: function (e) {
        /*--Met à jour les coordonnées de la souris lorsqu'elle est déplacée--*/
        CanvasForSign.getMousePos(e);

        /*--Dessine un point si le bouton de la souris est pressé--*/
        if (CanvasForSign.mouseDown == 1) {
            CanvasForSign.drawLine(ctx, CanvasForSign.mouseX, CanvasForSign.mouseY, 4);
        }
    },

    /*--Obtient la position actuelle de la souris par rapport à la partie supérieure gauche de la toile--*/
    getMousePos: function (e) {
        if (!e)
            var e = event;

        if (e.offsetX) {
            CanvasForSign.mouseX = e.offsetX;
            CanvasForSign.mouseY = e.offsetY;
        } else if (e.layerX) {
            CanvasForSign.mouseX = e.layerX;
            CanvasForSign.mouseY = e.layerY;
        }
    },

    /*--Dessine quelque chose quand un démarrage tactile est détecté--*/
    sketchpad_touchStart: function (e) {
        /*--Met à jour les coordonnées tactiles--*/
        CanvasForSign.getTouchPos();

        CanvasForSign.drawLine(ctx, CanvasForSign.touchX, CanvasForSign.touchY, 4);

        /*--Empêche le déclenchement d'un événement mousedown supplémentaire--*/
        event.preventDefault();
    },

    sketchpad_touchEnd: function () {
        /*--Réinitialise lastX et lastY à -1 pour indiquer qu'ils sont maintenant invalides, lors d'un lever "stylo"--*/
        CanvasForSign.lastX = -1;
        CanvasForSign.lastY = -1;
    },

    /*--Dessine quelque chose et empêche le défilement par défaut lorsque le mouvement tactile est détecté--*/
    sketchpad_touchMove: function (e) {
        /*--Met à jour les coordonnées tactiles--*/
        CanvasForSign.getTouchPos(e);

        /*--Lors d'un événement TouchMove, contrairement à un événement MouseMove, pas besoin de vérifier si le toucher est activé, car il y aura toujours un contact avec l'écran par définition.--*/
        CanvasForSign.drawLine(ctx, CanvasForSign.touchX, CanvasForSign.touchY, 4);

        /*--Empêche une action de défilement à la suite de ce déclenchement.--*/
        event.preventDefault();
    },

    /*--Obtient la position tactile par rapport à la partie supérieure gauche de la toile.Quand nous obtenons les valeurs brutes de pageX et pageY ci-dessous : Prise en compte du défilement sur la page mais pas la position relative à notre div cible. Ajustement en utilisant "target.offsetLeft" et "target.offsetTop" pour obtenir les bonnes valeurs par rapport à la partie supérieure gauche du canevas.--*/
    getTouchPos: function (e) {
        if (!e)
            var e = event;

        if (e.touches) {
            if (e.touches.length == 1) { /*--Ne traite qu'avec un doigt--*/
                var touch = e.touches[0]; /*--Obtient l'information pour le doigt #1--*/
                CanvasForSign.touchX = touch.pageX - touch.target.offsetLeft;
                CanvasForSign.touchY = touch.pageY - touch.target.offsetTop;
            }
        }
    },
}

$(document).ready(function () {
    CanvasForSign.init();
});
