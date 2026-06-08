using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessHours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HorariosFuncionamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DiaSemana = table.Column<int>(type: "int", nullable: false),
                    HoraAbertura = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFecho = table.Column<TimeSpan>(type: "time", nullable: false),
                    EstaAberto = table.Column<bool>(type: "bit", nullable: false),
                    NegocioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HorariosFuncionamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HorariosFuncionamento_Negocios_NegocioId",
                        column: x => x.NegocioId,
                        principalTable: "Negocios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HorariosFuncionamento_NegocioId",
                table: "HorariosFuncionamento",
                column: "NegocioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HorariosFuncionamento");
        }
    }
}
