export default function disambiguation(items: any, label: any, property = "name") {
    const itemList = items
        .map((item: any) => `"${(property ? item[property] : item).replace(/ /g, "\xa0")}"`)
        .join(",   ");
    return `Multiple ${label} found, please be more specific: ${itemList}`;
}

export { disambiguation };
