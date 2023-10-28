export default class MenuScene extends Phaser.Scene {

    handlerScene = null
    sceneStopped = false
    constructor() {
        super('menu');
    }

    preload() {
        this.width = this.game.screenBaseSize.width;
        this.height = this.game.screenBaseSize.height;

        this.handlerScene = this.scene.get('handler');
        this.handlerScene.sceneRunning = 'menu';
        this.sceneStopped = false;
    }
    create() {
        const  width = this.handlerScene.scale.width;
        const  height = this.handlerScene.scale.height;
        // CONFIG SCENE
        this.handlerScene.updateResize(this)
        // CONFIG SCENE

        const bg = this.add.image(0, 0, 'menu_background').setOrigin(0);
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        bg.setScale(scaleX, scaleY );
        this.add.text(540 * scaleX, 10 * scaleY, 'SurVIser', {
            color: 'white',
            fontSize: '100pt',
            fontFamily: 'grobold'
        });

        const character_selection_container = this.add.container(795 * scaleX, 350 * scaleY);
        // Create the hero selection objects but set them as invisible initially
        const characterSelectionBackground = this.add.image(0, 0, 'character_selection_background');
        const characterSelectionTitle = this.add.text( 110 - characterSelectionBackground.width / 2, - characterSelectionBackground.height / 2  + 30 , 'Character Selection', {
            color: 'white',
            fontSize: '42px',
            fontFamily: 'grobold'
        }).setOrigin(0);
        const characterBackground1 = this.add.image(130 - characterSelectionBackground.width / 2 ,50 - characterSelectionBackground.height / 5 , 'character_background').setVisible(false);
        const characterBackground1_selected = this.add.image(130 - characterSelectionBackground.width / 2 , 50 - characterSelectionBackground.height / 5 , 'character_selected_background').setVisible(false);
        const characterBackground2 = this.add.image(150 + characterBackground1.width - characterSelectionBackground.width / 2 , 50 - characterSelectionBackground.height / 5, 'character_background').setVisible(false);
        const todoCharacter = this.add.image(150 + characterBackground1.width - characterSelectionBackground.width / 2, 50 - characterSelectionBackground.height / 5, 'todo_character').setVisible(false);
        const todoLabel = this.add.text(110 + characterBackground1.width - characterSelectionBackground.width / 2, 110 - characterSelectionBackground.height / 5, '???', {
            color: 'white',
            fontSize: '40px',
            fontFamily: 'grobold'
        }).setVisible(false);
        const viCharacter = this.add.image(130 - characterSelectionBackground.width / 2,- 10 - characterSelectionBackground.height / 5, 'vi').setVisible(false);
        viCharacter.setScale(0.85);
        const viLabel = this.add.text(100 - characterSelectionBackground.width / 2, 110 - characterSelectionBackground.height / 5, 'Vi', {
            color: 'white',
            fontSize: '40px',
            fontFamily: 'grobold'
        }).setVisible(false);
        const tutorialBackground = this.add.image(0, 0, 'tutorial_background').setVisible(false);
        const tutorialLabel = this.add.text(180 - characterSelectionBackground.width / 2, - characterSelectionBackground.height / 2  + 30 , 'TUTORIAL', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        }).setVisible(false);

        character_selection_container.add([characterSelectionBackground, characterSelectionTitle, characterBackground1 ,
            characterBackground1_selected, characterBackground2, todoCharacter, todoLabel, viCharacter, viLabel, tutorialBackground, tutorialLabel]);
        character_selection_container.setSize(characterSelectionBackground.width, characterSelectionBackground.height);

        // Container for the start button
        const start_btn_container = this.add.container(795 * scaleX, 770 * scaleY);
        const start_btn = this.add.image(0, 0, 'green_btn');
        const startLabel = this.add.text(-80, -30, 'START', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        start_btn_container.add([start_btn, startLabel]);
        start_btn_container.setSize(start_btn.width, start_btn.height);

        // Container for the back button
        const back_btn_container = this.add.container(795 * scaleX, 770 * scaleY);
        const back_btn = this.add.image(0, 0, 'red_btn');
        const backLabel = this.add.text(-80, -30, 'BACK', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        back_btn_container.add([back_btn, backLabel]);
        back_btn_container.setSize(back_btn.width, back_btn.height);

        // Container for the confirm button
        const confirm_btn_container = this.add.container(795 * scaleX, 770 * scaleY);
        const confirm_btn = this.add.image(0, 0, 'green_btn');
        const confirmLabel = this.add.text(-110, -30, 'CONFIRM', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        confirm_btn_container.add([confirm_btn, confirmLabel]);
        confirm_btn_container.setSize(confirm_btn.width, confirm_btn.height);

        back_btn_container.setVisible(false);
        confirm_btn_container.setVisible(false);

        // Function to show the hero selection objects
        const showHeroSelection = () => {
            characterSelectionBackground.setVisible(true);
            characterSelectionTitle.setVisible(true);
            characterBackground1.setVisible(true);
            characterBackground2.setVisible(true);
            todoCharacter.setVisible(true);
            viCharacter.setVisible(true);
            viLabel.setVisible(true);
            todoLabel.setVisible(true);
        };

        // Function to hide the hero selection objects
        const hideHeroSelection = () => {
            characterSelectionBackground.setVisible(false);
            characterSelectionTitle.setVisible(false);
            characterBackground1.setVisible(false);
            characterBackground2.setVisible(false);
            todoCharacter.setVisible(false);
            viCharacter.setVisible(false);
            viLabel.setVisible(false);
            todoLabel.setVisible(false);
            characterBackground1_selected.setVisible(false);
        };

        let isHeroSelectionVisible = false;

        // Show hero selection when the start button is clicked
        start_btn_container.setInteractive()
            .on('pointerover', () => {
                start_btn.setTint(0x7DCEA0); // Apply darker tint
            })
            .on('pointerout', () => {
                start_btn.clearTint(); // Remove tint
            })
            .on('pointerdown', () => {
                this.sound.play('btn2_sound');
                isHeroSelectionVisible = true;
                showHeroSelection();
                start_btn_container.setVisible(false);
                back_btn_container.setVisible(true);
                confirm_btn_container.setVisible(false);
            });

        // Show start button when the back button is clicked
        back_btn_container.setInteractive()
            .on('pointerover', () => {
                back_btn.setTint(0xF1948A); // Apply darker tint
            })
            .on('pointerout', () => {
                back_btn.clearTint(); // Remove tint
            })
            .on('pointerdown', () => {
                this.sound.play('btn_sound');
                isHeroSelectionVisible = false;
                hideHeroSelection();
                start_btn_container.setVisible(true);
                back_btn_container.setVisible(false);
                confirm_btn_container.setVisible(false);
            });

        // Go to the next scene when the confirm button is clicked
        let confirmButtonPressed = false;

        // Go to the next scene or display tutorial background when the confirm button is clicked
        confirm_btn_container.setInteractive()
            .on('pointerover', () => {
                confirm_btn.setTint(0x7DCEA0); // Apply darker tint
            })
            .on('pointerout', () => {
                confirm_btn.clearTint(); // Remove tint
            })
            .on('pointerdown', () => {
                this.sound.play('btn2_sound');
                if (!confirmButtonPressed) {
                    tutorialBackground.setVisible(true);
                    tutorialLabel.setVisible(true);
                    confirmButtonPressed = true;
                } else {
                    this.scene.start('zeus');
                }
            });

        // Toggle visibility of characterBackground1_selected
        characterBackground1.setInteractive()
            .on('pointerover', () => {
                characterBackground1.setTint(0xE59866); // Apply darker tint
            })
            .on('pointerout', () => {
                characterBackground1.clearTint(); // Remove tint
            })
            .on('pointerdown', () => {
                this.sound.play('btn2_sound');
                characterBackground1_selected.setVisible(!characterBackground1_selected.visible);
                confirm_btn_container.setVisible(characterBackground1_selected.visible);
            });

        // Hide characterBackground1_selected when clicked
        characterBackground1_selected.setInteractive()
            .on('pointerover', () => {
                characterBackground1_selected.setTint(0x85C1E9); // Apply darker tint
            })
            .on('pointerout', () => {
                characterBackground1_selected.clearTint(); // Remove tint
            })
            .on('pointerdown', () => {
                this.sound.play('btn2_sound');
                characterBackground1_selected.setVisible(false);
                confirm_btn_container.setVisible(false);
            });

        // Hide hero selection initially
        hideHeroSelection();
    }


}
