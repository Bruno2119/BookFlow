using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileFieldsToUtilizador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Utilizadores",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Especialidades",
                table: "Utilizadores",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Utilizadores");

            migrationBuilder.DropColumn(
                name: "Especialidades",
                table: "Utilizadores");
        }
    }
}
