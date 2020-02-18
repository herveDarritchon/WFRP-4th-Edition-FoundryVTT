/**
 * Init function loads tables, registers settings, and loads templates
 */
Hooks.once("init", () => {

    // load tables from system folder
    FilePicker.browse("user", "systems/wfrp4e/tables").then(resp => {
      try 
      {
      if (resp.error)
        throw ""
      for (var file of resp.files)
      {
        try {
          if (!file.includes(".json"))
            continue
          let filename = file.substring(file.lastIndexOf("/")+1, file.indexOf(".json"));
          fetch(file).then(r=>r.json()).then(async records => {
            WFRP_Tables[filename] = records;
          })
        }
        catch(error) {
         console.error("Error reading " + file + ": " + error)
        }
      }
    }
    catch
    {
      // Do nothing
    }
    })
    // Create scatter table
    WFRP_Tables.scatter = {
      name : "Scatter",
      die : "1d10",
      rows : [
        {
          name : "Top Left",
          range: [1, 1]
        },
        {
          name : "Top Middle",
          range: [2, 2]
        },
        {
          name : "Top Right",
          range: [3, 3]
        },
        {
          name : "Center Left",
          range: [4, 4]
        },
        {
          name : "Center Right",
          range: [5, 5]
        },
        {
          name : "Bottom Left",
          range: [6, 6]
        },
        {
          name : "Bottom Middle",
          range: [7, 7]
        },
        {
          name : "Bottom Right",
          range: [8, 8]
        },
        {
          name : "At your feet",
          range: [9, 9]
        },
        {
          name : "At the target's feet",
          range: [10, 10]
        },
      ]
    }
  
    // Create Winds table
    WFRP_Tables.winds = {
      name : "The Swirling Winds",
      die : "1d10",
      rows : [
        {
          modifier : "-30",
          range: [1, 1]
        },
        {
          modifier : "-10",
          range: [2, 3]
        },
        {
          modifier : "0",
          range: [4, 7]
        },
        {
          modifier : "+10",
          range: [8, 9]
        },
        {
          modifier : "+30",
          range: [10, 10]
        }
      ]
    }

  
    // Register initiative rule
    game.settings.register("wfrp4e", "initiativeRule", {
      name: "Initiative Rules",
      hint: "Configure which method is used to determine who acts first in combat.",
      scope: "world",
      config: true,
      default: "default",
      type: String,
      choices: {
        "default": "Default (Highest to Lowest Initative, Agility Tiebreaks)",
        "sl": "Roll an Initiative test, higher SL goes first",
        "d10Init": "Roll a d10 and add Initiative, higher goes first",
        "d10InitAgi": "Roll a d10, add Initiative Bonus and Agility Bonus, higher goes first"
      },
      onChange: rule => _setWfrp4eInitiative(rule)
    });
    _setWfrp4eInitiative(game.settings.get("wfrp4e", "initiativeRule"));
  
  
    function _setWfrp4eInitiative(initMethod)
    {
      let formula;
      switch (initMethod)
      {
        case "default":
        formula = "@characteristics.i.value + @characteristics.ag.value/100";
        break;
  
        case "sl":
        formula = "(floor(@characteristics.i.value / 10) - floor(1d100/10))"
        break;
  
        case "d10Init":
        formula = "1d10 + @characteristics.i.value"
        break;
  
        case "d10InitAgi":
        formula = "1d10 + @characteristics.i.bonus + @characteristics.ag.bonus"
        break;
      }
  
      let decimals = (initMethod == "default") ? 2 : 0;
      CONFIG.initiative = {
        formula: formula,
        decimals: decimals
      }
    }
  
  
     // Register Advantage cap
     game.settings.register("wfrp4e", "capAdvantageIB", {
       name: "Cap Advantage at IB",
       hint: "Sets the max value of Advantage as the character's Initiative Bonus",
       scope: "world",
       config: true,
       default: false,
       type: Boolean
     });
  
    // Register Fast SL rule
    game.settings.register("wfrp4e", "fastSL", {
      name: "Fast SL",
      hint: "Determine SL with the Fast SL optional rule as described on page 152",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });
  
    // Register Tests above 100% Rule
    game.settings.register("wfrp4e", "testAbove100", {
      name: "Tests Above 100%",
      hint: "Use optional rule Tests Above 100% as described on p 151. A successful Test gains +1 SL for each full 10% a tested Characteristic or Skill exceeds 100%",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });

    // Register Criticals/Fumbles on all tests
    game.settings.register("wfrp4e", "criticalsFumblesOnAllTests", {
      name: "Criticals and Fumbles on all Tests",
      hint: "Rolling a double on any test results in an Astounding Success/Failure.",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });
  
  
      // Register Extended Tests
      game.settings.register("wfrp4e", "extendedTests", {
        name: "Extended Tests and 0 SL",
        hint: "Rolling a +/- 0 on Extended Tests (currently only Channelling) results in a +1/-1 respectively (p155).",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
      });
  
      // Register Test auto-fill
      game.settings.register("wfrp4e", "testAutoFill", {
        name: "Test Dialog Auto Populate",
        hint: "This setting automatically fills out information in the dialog for Tests. Some examples include: Wielding Defensive weapons automatically fills 'SL Bonus' in roll dialogs for melee weapons. This only occurs if it is not the actor's turn. Also when wieldirg an Accurate or (Im)precise Weapon (on the actor's turn).",      scope: "world",
        config: true,
        default: true,
        type: Boolean
      });
  
      // Register NPC Species Randomization
      game.settings.register("wfrp4e", "npcSpeciesCharacteristics", {
        name: "Set Average NPC Characteristics",
        hint: "Entering a recognized species value for an NPC automatically sets their characteristics to the average value for the species",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
      });
  
      // Register Partial Channelling
      game.settings.register("wfrp4e", "partialChannelling", {
        name: "Partial Channelling",
        hint: "A common house rule that improves the flexibility of Channelling. Instead of requiring the SL to reach the spell's CN, you can instead cast at anytime with the CN reduced by the SL gained so far.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
      });

      // Register Round Summary
      game.settings.register("wfrp4e", "displayRoundSummary", {
        name: "Display Round Summary",
        hint: "When a round ends, display all combatants with conditions.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
      });
  
      // Register Status on Turn Start
      game.settings.register("wfrp4e", "statusOnTurnStart", {
        name: "Show Combatant Status on Turn Start",
        hint: "When a Combatant starts their turn, their status is shown (Conditions and Modifiers). This status message is identical to the one shown from right clicking the combatant.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
      });       
  
  
      // Register Focus on Turn Start
      game.settings.register("wfrp4e", "focusOnTurnStart", {
        name: "Focus on Turn Start",
        hint: "When advancing the combat tracker, focus on the token that's going next.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
      });
  
      // Register Hiding Test Data
      game.settings.register("wfrp4e", "hideTestData", {
        name: "Hide Test Data",
        hint: "GM test chat cards don't show sensitive NPC data to players.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
      });

      // Register Manual Chat Cards
      game.settings.register("wfrp4e", "manualChatCards", {
        name: "Manual Chat Cards",
        hint: "Show blank roll result to fill in if physical dice are used..",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
      });
  
  
    // Pre-load templates
    loadTemplates([
      "systems/wfrp4e/templates/actors/actor-attributes.html",
      "systems/wfrp4e/templates/actors/actor-abilities.html",
      "systems/wfrp4e/templates/actors/actor-main.html",
      "systems/wfrp4e/templates/actors/actor-combat.html",
      "systems/wfrp4e/templates/actors/actor-biography.html",
      "systems/wfrp4e/templates/actors/actor-inventory.html",
      "systems/wfrp4e/templates/actors/actor-skills.html",
      "systems/wfrp4e/templates/actors/actor-magic.html",
      "systems/wfrp4e/templates/actors/actor-religion.html",
      "systems/wfrp4e/templates/actors/actor-talents.html",
      "systems/wfrp4e/templates/actors/actor-classes.html",
      "systems/wfrp4e/templates/actors/actor-notes.html",
      "systems/wfrp4e/templates/actors/npc-main.html",
      "systems/wfrp4e/templates/actors/npc-notes.html",
      "systems/wfrp4e/templates/actors/creature-main.html",
      "systems/wfrp4e/templates/actors/creature-notes.html",
      "systems/wfrp4e/templates/actors/creature-main.html",
      "systems/wfrp4e/templates/chat/dialog-constant.html",
      "systems/wfrp4e/templates/chat/test-card.html",
      "systems/wfrp4e/templates/items/item-header.html",
      "systems/wfrp4e/templates/items/item-description.html",
    ]);

    // Load name construction from files
    NameGenWfrp._loadNames();
  });