import menu_background from "../assets/sprites/ui/menu_background.png";
import green_btn from "../assets/sprites/ui/green_btn.png";
import red_btn from "../assets/sprites/ui/red_btn.png";
import character_selection_background from "../assets/sprites/ui/character_selection_background.png";
import character_background from "../assets/sprites/ui/character_background.png";
import character_selected_background from "../assets/sprites/ui/character_selected_background.png";
import todo_character from "../assets/sprites/ui/todo_character.png";


export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    preload() {
        this.load.image('menu_background', menu_background);
        this.load.image('green_btn', green_btn);
        this.load.image('red_btn', red_btn);
        this.load.image('character_selection_background', character_selection_background);
        this.load.image('character_background', character_background);
        this.load.image('character_selected_background', character_selected_background);
        this.load.image('todo_character', todo_character);
    }

    create() {
        this.add.image(0, 0, 'menu_background').setOrigin(0);
        this.add.text(540, 10, 'SurVIser', {
            color: 'white',
            fontSize: '100pt',
            fontFamily: 'grobold'
        });

        // Create the hero selection objects but set them as invisible initially
        const characterSelectionBackground = this.add.image(795, 350, 'character_selection_background');
        const characterSelectionTitle = this.add.text(590, 90, 'Character Selection', {
            color: 'white',
            fontSize: '42px',
            fontFamily: 'grobold'
        });
        const characterBackground1 = this.add.image(600, 280, 'character_background').setVisible(false);
        const characterBackground1_selected = this.add.image(600, 280, 'character_selected_background').setVisible(false);
        const characterBackground2 = this.add.image(795, 280, 'character_background').setVisible(false);
        const todoCharacter = this.add.image(795, 280, 'todo_character').setVisible(false);
        const viCharacter = this.add.image(600, 280, 'vi').setVisible(false);

        // Container for the start button
        const start_btn_container = this.add.container(795, 770);
        const start_btn = this.add.image(0, 0, 'green_btn');
        const startLabel = this.add.text(-80, -30, 'START', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        start_btn_container.add([start_btn, startLabel]);
        start_btn_container.setSize(start_btn.width, start_btn.height);

        // Container for the back button
        const back_btn_container = this.add.container(795, 770);
        const back_btn = this.add.image(0, 0, 'red_btn');
        const backLabel = this.add.text(-80, -30, 'BACK', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        back_btn_container.add([back_btn, backLabel]);
        back_btn_container.setSize(back_btn.width, back_btn.height);

        // Container for the confirm button
        const confirm_btn_container = this.add.container(795, 770);
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
        };

        // Function to hide the hero selection objects
        const hideHeroSelection = () => {
            characterSelectionBackground.setVisible(false);
            characterSelectionTitle.setVisible(false);
            characterBackground1.setVisible(false);
            characterBackground2.setVisible(false);
            todoCharacter.setVisible(false);
            viCharacter.setVisible(false);
            characterBackground1_selected.setVisible(false);
        };

        let isHeroSelectionVisible = false;

        // Show hero selection when the start button is clicked
        // Show hero selection when the start button is clicked
        start_btn_container.setInteractive().on('pointerdown', () => {
            isHeroSelectionVisible = true;
            showHeroSelection();
            start_btn_container.setVisible(false);
            back_btn_container.setVisible(true);
            confirm_btn_container.setVisible(false);
        });

        // Show start button when the back button is clicked
        back_btn_container.setInteractive().on('pointerdown', () => {
            isHeroSelectionVisible = false;
            hideHeroSelection();
            start_btn_container.setVisible(true);
            back_btn_container.setVisible(false);
            confirm_btn_container.setVisible(false);
        });

        // Go to the 'zeus' scene when the confirm button is clicked
        confirm_btn_container.setInteractive().on('pointerdown', () => {
            this.scene.start('zeus');
        });

        // Toggle visibility of characterBackground1_selected
        characterBackground1.setInteractive().on('pointerdown', () => {
            characterBackground1_selected.setVisible(!characterBackground1_selected.visible);
            confirm_btn_container.setVisible(characterBackground1_selected.visible);
        });

        // Hide characterBackground1_selected when clicked
        characterBackground1_selected.setInteractive().on('pointerdown', () => {
            characterBackground1_selected.setVisible(false);
            confirm_btn_container.setVisible(false);
        });

        // Hide hero selection initially
        hideHeroSelection();
    }



}
