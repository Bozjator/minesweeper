import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private numOfRows: number = 10;
  private numOfCols: number = 10;
  private mineTableContent: any[];
  private mineTableVisibility: any[];
  private numOfMinesInTable = 15;
  private mineLabel: number = -1;
  private gameOver: boolean;

  private uiTooMuchMinesShowWarning: boolean = false;

  constructor() {
    this.startGame();
  }

  startGame(): void {
    this.initMineTable();
    this.gameOver = false;
  }

  initMineTable(): void {
    // Create 2d array filed with zeros.
    this.createMineTable();
    // Puting mines in the table.
    this.putMinesInTheTable();
    // Count mines around every cell in the table.
    this.countMinesAroundEveryCellInTable();

    // Print mines table in console.
    //console.log(this.mineTableContent);
  }

  createTableFromUserInput(numOfRowsUserInput: number, numOfColsUserInput: number, numOfMinesInTableUserInput): void {
    // We need to check that user doesn't put to much mines in the table.
    // Because if the number of mines in the table is larger or the same of number of the cell in the table,
    // then method for puting the mines in the table would fail and would be an infinity loop.
    this.uiTooMuchMinesShowWarning = false;
    let numOfTableCells: number = numOfRowsUserInput * numOfColsUserInput;
    if (numOfMinesInTableUserInput > numOfTableCells) {
      this.uiTooMuchMinesShowWarning = true;
      return;
    }

    // Save user input into variables.
    this.numOfRows = numOfRowsUserInput;
    this.numOfCols = numOfColsUserInput;
    this.numOfMinesInTable = numOfMinesInTableUserInput;

    // Recreate mines table.
    this.startGame();
  }

  isAnyIndexOutsideMineTable(rowIndex: number, colIndex: number): boolean {
    // The same as code below.
    // Checks if any index is outsit table on top (row) or left (col) or bottom (row) or right (col).
    return rowIndex < 0 || colIndex < 0 || rowIndex >= this.numOfRows || colIndex >= this.numOfCols;
  }

  checkIfCellContainsMine(rowIndex: number, colIndex: number): boolean {
    // Check if any of indexes is outside the mine table.
    if (this.isAnyIndexOutsideMineTable(rowIndex, colIndex))
      return false;

    return this.mineTableContent[rowIndex][colIndex] == this.mineLabel;
  }

  createMineTable(): void {
    // Put row array into mine table variables.
    this.mineTableContent = new Array();
    this.mineTableVisibility = new Array();

    // For every row create array for columns.
    for (var rowIndex = 0; rowIndex < this.numOfRows; rowIndex++) {
      // For current row create array for column.
      this.mineTableContent[rowIndex] = new Array();
      this.mineTableVisibility[rowIndex] = new Array();
      // For every column in this row put 0 inside it.
      for (var colIndex = 0; colIndex < this.numOfCols; colIndex++) {
        this.mineTableContent[rowIndex][colIndex] = 0;
        this.mineTableVisibility[rowIndex][colIndex] = 0;
      }
    }
  }

  putMinesInTheTable(): void {
    for (let minesCounter = 0; minesCounter < this.numOfMinesInTable; minesCounter++) {
      // Get random coordinates (indexes) for inside the mine table.
      let randomRowIndex = Math.floor(Math.random() * this.numOfRows);
      let randomColIndex = Math.floor(Math.random() * this.numOfCols);

      // If mine is already in this cell that we randomly got, we need to decrease counter,
      // because of minesCounter in the loop declaration (minesCounter++), so that the 
      // correct number of mines is put into mine table.
      if (this.checkIfCellContainsMine(randomRowIndex, randomColIndex)) {
        --minesCounter;
        // With continue; we stop exectuting current loop step and jump to the next loop step.
        continue;
      }

      // Put mine in the table.
      this.mineTableContent[randomRowIndex][randomColIndex] = this.mineLabel;
    }
  }

  countMinesAroundEveryCellInTable(): void {
    for (var rowIndex = 0; rowIndex < this.numOfRows; rowIndex++) {
      for (var colIndex = 0; colIndex < this.numOfCols; colIndex++) {
        // If there is a mine in this cell then we don't count mines around it.
        if (this.checkIfCellContainsMine(rowIndex, colIndex)) {
          continue;
        }

        // Mine counter variable is of type array so that we can pass this variable to method isMineInGivenCell() by
        // reference (instead of as a value). This way we can change its value inside the method.
        let currentCellMinesCounter: number[] = [];
        currentCellMinesCounter[0] = 0;
        let minesCounter: number = 0;

        // Top left cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex - 1, colIndex - 1) ? 1 : 0;
        // Bottom right cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex + 1, colIndex + 1) ? 1 : 0;
        // Top right cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex - 1, colIndex + 1) ? 1 : 0;
        // Bottom left cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex + 1, colIndex - 1) ? 1 : 0;
        // Bottom cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex + 1, colIndex) ? 1 : 0;
        // Top cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex - 1, colIndex) ? 1 : 0;
        // Left cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex, colIndex - 1) ? 1 : 0;
        // Right cell from current cell.
        minesCounter += this.checkIfCellContainsMine(rowIndex, colIndex + 1) ? 1 : 0;

        // Mines around current cell is now counted so save that number into current mine table cell.
        this.mineTableContent[rowIndex][colIndex] = currentCellMinesCounter[0];
      }
    }
  }

  revealCellAndContentAround(rowIndex: number, colIndex: number): void {
    // Prevent user to click on the mine table if the game is already over.
    if (this.gameOver)
      return;

    // Reveal the cell.
    this.mineTableVisibility[rowIndex][colIndex] = 1;

    // Check if cell contains mine.
    if (this.checkIfCellContainsMine(rowIndex, colIndex)) {
      this.gameOver = true;
    } else if (this.mineTableContent[rowIndex][colIndex] == 0) {
      this.mineTableVisibility[rowIndex][colIndex] = 0;
      this.revealZeroCellsAroundGiveCell(rowIndex, colIndex);
    }
  }

  /**
   * This method revels zeros around given cell and also first cell that contains number. 
   * Algorithem https://en.wikipedia.org/wiki/Flood_fill
   * 
   * @param rowIndex 
   * @param colIndex 
   */
  revealZeroCellsAroundGiveCell(rowIndex: number, colIndex: number): void {
    // If any given index is outside the mine table, then don't do anything.
    if (this.isAnyIndexOutsideMineTable(rowIndex, colIndex))
      return;

    // If cell is already reveild then don't do anything.
    if (this.mineTableVisibility[rowIndex][colIndex] == 1)
      return;

    // Reveal cell.
    this.mineTableVisibility[rowIndex][colIndex] = 1;

    // If cell content is not a zero, then don't do anything.
    if (this.mineTableContent[rowIndex][colIndex] != 0)
      return;

    // For current cell check cells on north, south, east and west.
    this.revealZeroCellsAroundGiveCell(rowIndex - 1, colIndex);
    this.revealZeroCellsAroundGiveCell(rowIndex + 1, colIndex);
    this.revealZeroCellsAroundGiveCell(rowIndex, colIndex + 1);
    this.revealZeroCellsAroundGiveCell(rowIndex, colIndex - 1);
  }

  revealMineTable(): void {
    for (var rowIndex = 0; rowIndex < this.mineTableVisibility.length; rowIndex++) {
      for (var colIndex = 0; colIndex < this.mineTableVisibility[rowIndex].length; colIndex++) {
        this.mineTableVisibility[rowIndex][colIndex] = 1;
      }
    }
  }

}