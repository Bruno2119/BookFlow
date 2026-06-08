using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNegocioIdToUtilizador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NegocioId",
                table: "Utilizadores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Negocios",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImagemUrl",
                table: "Negocios",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Utilizadores_NegocioId",
                table: "Utilizadores",
                column: "NegocioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilizadores_Negocios_NegocioId",
                table: "Utilizadores",
                column: "NegocioId",
                principalTable: "Negocios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilizadores_Negocios_NegocioId",
                table: "Utilizadores");

            migrationBuilder.DropIndex(
                name: "IX_Utilizadores_NegocioId",
                table: "Utilizadores");

            migrationBuilder.DropColumn(
                name: "NegocioId",
                table: "Utilizadores");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Negocios");

            migrationBuilder.DropColumn(
                name: "ImagemUrl",
                table: "Negocios");
        }
    }
}
