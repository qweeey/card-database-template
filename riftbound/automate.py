import csv
from pathlib import Path

IMAGE_FOLDER = Path(__file__).parent.parent / "riftbound-images"
CSV_PATH = Path(__file__).parent / "cards.csv"

HEADER = [
    "name",
    "set",
    "quantity",
    "type",
    "color",
    "altArt",
    "overnumbered",
    "image"
]

KNOWN_SETS = {
    "OGN",
    "SFD",
    "UNL",
    "VEN"
}


def load_existing_cards():
    if not CSV_PATH.exists():
        return []

    with CSV_PATH.open(
        "r",
        newline="",
        encoding="utf-8"
    ) as csvfile:

        reader = csv.DictReader(csvfile)

        return list(reader)


def filename_to_card(image_path):

    parts = image_path.stem.split("-")

    alt_art = False
    overnumbered = False


    # -------------------------
    # CHECK OVERNUMBERED
    # -------------------------

    if parts and parts[-1].lower() == "o":
        overnumbered = True
        parts.pop()


    # -------------------------
    # CHECK ALT ART
    # -------------------------

    if parts and parts[-1].lower() == "a":
        alt_art = True
        parts.pop()


    # -------------------------
    # GET SET
    # -------------------------

    if not parts:
        return None

    set_code = parts[-1].upper()


    if set_code not in KNOWN_SETS:

        print(
            f"Skipping {image_path.name}: "
            f"unknown set"
        )

        return None


    parts.pop()


    # -------------------------
    # GET CARD NAME
    # -------------------------

    name = " ".join(parts).title()


    return {
        "name": name,
        "set": set_code,
        "quantity": "0",
        "type": "",
        "color": "",
        "altArt": str(alt_art).lower(),
        "overnumbered": str(overnumbered).lower(),
        "image": image_path.name
    }


def main():

    cards = load_existing_cards()


    # Store existing image names
    existing_images = {
        card["image"].strip().lower()
        for card in cards
    }


    added = 0


    for image_path in IMAGE_FOLDER.iterdir():

        if not image_path.is_file():
            continue


        if image_path.suffix.lower() != ".avif":
            continue


        # Already exists in cards.csv
        if image_path.name.lower() in existing_images:

            print(
                f"Already exists: "
                f"{image_path.name}"
            )

            continue


        card = filename_to_card(
            image_path
        )


        if card is None:
            continue


        cards.append(card)

        existing_images.add(
            image_path.name.lower()
        )


        added += 1


        print(
            f"Added: "
            f"{card['name']} "
            f"({card['set']})"
        )


    # Save updated cards.csv
    with CSV_PATH.open(
        "w",
        newline="",
        encoding="utf-8"
    ) as csvfile:

        writer = csv.DictWriter(
            csvfile,
            fieldnames=HEADER
        )

        writer.writeheader()

        writer.writerows(cards)


    print()
    print(
        f"Finished! Added {added} new cards."
    )


if __name__ == "__main__":
    main()