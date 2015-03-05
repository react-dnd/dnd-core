'use strict';

import { Actions } from 'flummox'

export default class DragDropActions extends Actions {
  beginDrag({ itemType, item }) {
    return { itemType, item };
  }
}