var Map = {
    /*--Clé api Lyon Vélib--*/
    apiLyon: 'https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=2050b861e29ee1b064c3137c631501af2362912a',
    map: null,
    reservationPanel: $('.reservation'),
    stationName: $('.station_name'),
    stationAddress: $('.station_adresse'),
    availableBikes: $('.velos_dispo'),
    infoStationPanel: $('.station_info'),
    reservationButton: $('.bouton_reservation'),
    submitButton: $('#valider'),
    currentReservMessage: $('.texte_footer'),
    cancelReservation: $('.annuler'),
    timerText: $('.texte_temps'),
    x: null,

    /*--fond de la carte google map, appel de l'api vélib de Lyon, cacher le décompte dans le footer--*/
    init: function () {
        Map.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 45.754043,
                lng: 4.861051
            },
            zoom: 13,
            minZoom: 11,
            scrollwheel: false,
        });

        Map.hideCountDownPanel();
        Map.callApiVelib();

    },
    /*--Ajoute un "markerclusterer" pour regrouper les marqueurs simples--*/
    displayMarkerCluster: function (map, markers) {
        var markerCluster = new MarkerClusterer(Map.map, markers, {
            imagePath: './img/m/m',

        });
    },

    /*--lorsqu'il n'y a pas de réservation en cours: pas de compte à rebours, pas de bouton d'annulation--*/
    hideCountDownPanel: function () {
        Map.timerText.hide();
        Map.cancelReservation.hide();
    },

    /*--Cacher les informations de la station précédente pour cliquer sur une station différente--*/
    hideInfosStation: function () {
        Map.reservationPanel.fadeOut();
        Map.stationName.hide();
        Map.stationAddress.hide();
        Map.availableBikes.hide();
    },
    /*--Compte à rebours--*/
    countDown: function () {
        var finishDate = new Date().getTime() + 1200000;
        Map.x = setInterval(function () {
            var now = new Date().getTime();

            var distance = finishDate - now;

            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            /*-- Afficher le résultat dans l'élément avec id = "demo"--*/
            Map.timerText.fadeIn();
            Map.timerText.text(minutes + " minutes " + seconds + " secondes ");
            /*--Si le compte à rebours est terminé, écrire un texte--*/
            if (distance < 0) {
                clearInterval(Map.x);
                Map.currentReservMessage.text('Votre réservation a expiré');
                Map.timerText.text('');
            }
        }, 999);

    },

    /*-- Appel de l'apiLyon, afficher les marqueurs et les groupeurs, la réservation et le compte à rebours--*/
    callApiVelib: function () {
        ajaxGet(Map.apiLyon, function (reponse) {
            /*--Répondre dans un tableau Javascript (array)--*/
            var stations = JSON.parse(reponse);
            markers = [];
            /*--Pour chaque station, création d'un marqueur sur la carte + définition des actions en cliquant sur ce marqueur--*/
            stations.forEach(function (station) {
                var marker = new google.maps.Marker({
                    position: station.position,
                    anchor: new google.maps.Point(0, 20),
                    origin: (0, 0),
                    map: Map.map,
                    title: station.name,
                });


                markers.push(marker);

                /*--Changement de l'apparence des marqueurs simples de la carte : j'ai fait en sorte que l'on puisse voir s'il y a 0 vélo ou au moins 1 vélo au premier coup d'oeil. Icône vélo rouge = pas de vélo dispo, icône vélo orange = entre 1 et 5 vélos disponibles, icône vélo vert = au moins 5 vélos disponibles--*/
                var markerSetIcon = Number(station.available_bikes);

                /*-Dispo : Si 0 vélo dans la station--*/
                if (markerSetIcon === 0) {
                    marker.setIcon('./img/velo_rouge.png');
                } else {
                    /*-Dispo : Si 5 vélos ou moins de 5 vélos dans la station--*/
                    if (markerSetIcon <= 5) {
                        marker.setIcon('./img/velo_orange.png');
                        /*-Dispo : Si plus de 5 vélos dans la station--*/
                    } else {
                        marker.setIcon('./img/velo_vert.png');
                    }
                }

                /*--Afficher les "infosStations" au clique sur le marqueur--*/
                marker.addListener('click', function () {
                    Map.hideInfosStation();
                    Map.reservationButton.css('display', 'block');
                    Map.stationName.text('Nom de la station : ' + station.name);
                    Map.stationAddress.text('Adresse : ' + station.address);
                    Map.availableBikes.text('Vélo\'V disponible(s) : ' + station.available_bikes);
                    Map.stationName.fadeIn('slow');
                    Map.stationAddress.fadeIn('slow');
                    Map.availableBikes.fadeIn('slow');
                    /*--Clique sur un marqueur, animation défilement en douceur jusqu'au panneau d'informations pour une meilleure expérience pour les appareils mobiles--*/
                    $('html, body').animate({
                            scrollTop: Map.infoStationPanel.offset().top
                        },
                        'slow'
                    );

                    /*--Affiche le panneau de réservation si clique sur le bouton de réservation--*/
                    Map.reservationButton.click(function () {
                        if (station.available_bikes > 0) {
                            Map.reservationPanel.css('display', 'block');
                            Map.availableBikes.text('Il y a ' + station.available_bikes + ' Vélo\'V(s) disponible(s) à réserver !');
                        } else {
                            Map.availableBikes.text('Il n\' y a aucun Vélo\'V disponible à réserver !');
                            Map.reservationButton.css('display', 'none');
                            Map.reservationPanel.css('display', 'none');
                        }
                        /*--En cliquant sur un marqueur, animation défilement en douceur vers le panneau de réservation pour une meilleure expérience pour les appareils mobiles--*/
                        $('html, body').animate({
                                scrollTop: Map.reservationPanel.offset().top
                            },
                            'slow'
                        );
                    });

                    /*--Enregistrer la réservation lors de la validation--*/
                    Map.submitButton.click(function () {
                        sessionStorage.setItem('nom_station', station.name);
                        sessionStorage.setItem('adresse_station', station.address);
                        sessionStorage.setItem('vélos_restants', station.available_bikes - 1);
                        
                        
                        Map.reservationPanel.css('display', 'none');
                        Map.reservationButton.css('display', 'none');
                        Map.availableBikes.text('Vous avez réservé 1 Vélo\'V à cette station');
                        Map.currentReservMessage.text('Vous avez réservé 1 Vélo\'V à la station : ' + sessionStorage.nom_station + ' pour :');
                        Map.cancelReservation.show();

                        /*--Réinitialiser un compte à rebours s'il y a précédemment une réservation--*/
                        clearInterval(Map.x);
                        /*--Démarrer un nouveau compte à rebours pour la réservation en cours-*/
                        Map.countDown();

                        /*--Annulation de la réservation--*/
                        Map.cancelReservation.click(function () {
                            clearInterval(Map.x);
                            Map.currentReservMessage.text('');
                            Map.timerText.text('La réservation est annulée');
                            Map.cancelReservation.hide();
                        })
                    })
                });
            })
            Map.displayMarkerCluster(map, markers);
        })
    },

}


$(function () {
    Map.init();

})
