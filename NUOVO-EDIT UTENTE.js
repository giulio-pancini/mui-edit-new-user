import React, { useEffect, useState } from "react";
import EditWindow from "../../../components/template/EditWindow";
import i18next from "i18next";
import { useDispatch, useSelector } from "react-redux";
import { activateLoading, deactivateLoading } from "../../../store/features/globalLoadingReducer";
import { axiosFetchAllCombo, axiosPost, standardAxiosPost } from "../../../utils/AxiosUtils";
import { setGlobalError } from "../../../store/features/globalErrorReducer";
import { COMBO, GRID, TEXTFIELD } from "../../../utils/ComponentList";
import { CONTAINS, EQUAL, STARTS_WITH } from "../../../utils/FiltersOperators";
import SaitRowActionDelete from "../../../components/atomic/Columns/SaitRowActionDelete";
import SaitRowAction from "../../../components/atomic/Columns/SaitRowAction";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { checkOpen } from "../../../utils/SaitUtils";

const NuovoUtente = (props) => {
	const userPreferences = useSelector((state) => state["auth"]);
	const dispatch = useDispatch();
	const [itemsIwswadbdlingue, setItemsIwswadbdlingue] = useState([]);
	const [filterLeftGrid, setFilterLeftGrid] = useState(false);
	const [filterRightGrid, setFilterRightGrid] = useState(false);

	const reloadGrid = () => {
		setFilterLeftGrid(true);
		setFilterRightGrid(true);
	};

	const onClose = () => {
		resetUtente();
		props.close();
	};

	useEffect(() => {
		if (checkOpen(props.open)) {
			const comboQueries = [
				{
					findFunction: "findIwswsysdcatmoduliUser",
					orderBy: [{ property: "moduleName", direction: "ASC" }],
					findFilters: [
						{
							operator: EQUAL,
							name: "uteIdUtente",
							value: props.utente.idUtente,
						},
					],
					setItems: "",
				},
			];
			axiosFetchAllCombo(comboQueries);
		}
	}, [props.open, props.utente.idUtente]);

	const removeModuleUser = async (itemDel) => {
		await standardAxiosPost({
			dispatch: dispatch,
			procedureName: "delRecordIwscsysdcatmoduliUser",
			parameters: itemDel,
			onSuccess: () => {
				reloadGrid();
			},
		});
	};

	const addModuleToUser = async (itemAdd) => {
		await standardAxiosPost({
			dispatch: dispatch,
			procedureName: "saveRecordIwscsysdcatmoduliUser",
			parameters: itemAdd,
			onSuccess: () => {
				reloadGrid();
			},
		});
	};

	const onSave = async () => {
		const module = localStorage.getItem("jswsModule");
		dispatch(activateLoading(module));
		if (props.isNewUser) {
			const saveUtente = nuovoUtente;
			saveUtente.idPersona = saveUtente.idUtente;
			const resp = await axiosPost("saveRecordIwswsysdutentiSedi", saveUtente);
			if (resp["success"]) {
				props.reloadGrid();
				onClose();
			} else {
				dispatch(
					setGlobalError({
						module: module,
						errorMessage: resp["message"],
					})
				);
			}
			dispatch(deactivateLoading(module));
		} else {
			const saveUtente = props.editSelectedRow;
			const resp = await axiosPost("", saveUtente);
			///////////////////////////////////////////////////////////////////////////////
			// MANCA PROCEDURA PER IL SALVATAGGIO
			///////////////////////////////////////////////////////////////////////////////
			if (resp["success"]) {
				props.reloadGrid();
				onClose();
			} else {
				dispatch(
					setGlobalError({
						module: module,
						errorMessage: resp["message"],
					})
				);
			}
			dispatch(deactivateLoading(module));
		}
	};

	useEffect(() => {
		const comboQueries = [
			{
				findFunction: "findIwswadbdlingue",
				orderBy: [{ property: "lingua", direction: "ASC" }],
				findFilters: [],
				setItems: setItemsIwswadbdlingue,
			},
		];

		axiosFetchAllCombo(comboQueries);
	}, []);

	const utenteBase = {
		idUtente: "",
		sctIdnDbDomain: userPreferences.idnDbDomain,
		sctCodSocieta: userPreferences.codSocieta,
		codSede: userPreferences.codSede,
		nome: "",
		cognome: "",
		password: "",
		flSedeDefault: "Y",
		linguaIso: "",
		idPersona: "",
		grpCodGruppo: "",
		flAdministrator: "",
		descrizioneBreve: "Principale",
		tipoAutenticazione: "DB",
		autUrl: "",
		autUrlbck: "",
		autFilter: "",
		autAttributes: "",
		autContext: "",
		autConnUser: "",
		autConnPass: "",
		autProtocol: "DB",
		hashingMethod: "SHA512",
	};

	const moduloUtenteBase = {
		moduleName: "",
		uteIdUtente: props.utente.idUtente,
		uteSctIdnDbDomain: userPreferences.idnDbDomain,
		uteSctCodSocieta: userPreferences.codSocieta,
		uteCodSede: userPreferences.codSede,
		moduleTitle: "",
		flAttivo: "Y",
		flReadOnly: null,
		livelloAccesso: 1000,
	};

	const resetUtente = () => {
		setNuovoUtente(utenteBase);
	};

	const [nuovoUtente, setNuovoUtente] = useState(utenteBase);

	const fields = [
		{
			title: i18next.t("data") + " " + i18next.t("user"),
			items: [
				props.isNewUser
					? {}
					: {
							label: i18next.t("domain"),
							name: "sctIdnDbDomain",
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
					  },
				props.isNewUser
					? {}
					: {
							label: i18next.t("company"),
							name: "sctCodSocieta",
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
					  },
				props.isNewUser
					? {}
					: {
							label: i18next.t("company_site"),
							name: "codSede",
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
					  },
				{
					label: i18next.t("id") + " " + i18next.t("user"),
					name: "idUtente",
					type: TEXTFIELD,
					required: true,
					disabled: props.isNewUser ? false : true,
					width: "30%",
				},
				{
					label: i18next.t("password"),
					name: "password",
					type: TEXTFIELD,
					password: "password",
					disabled: props.isNewUser ? false : true,
					required: true,
					width: "30%",
				},
				{
					label: i18next.t("language") + " " + i18next.t("iso"),
					name: [{ storeName: "linguaIso", comboName: "isoSigla" }],
					type: COMBO,
					description: "$(isoSigla) - $(descrizione)",
					items: itemsIwswadbdlingue,
					required: true,
					width: "30%",
				},
				/* {
					label: i18next.t("language") + " " + i18next.t("iso"),
					name: "linguaIso",
					type: TEXTFIELD,
					width: "30%",
				}, */
				{
					label: i18next.t("name"),
					name: "nome",
					type: TEXTFIELD,
					width: "30%",
				},
				{
					label: i18next.t("surname"),
					name: "cognome",
					type: TEXTFIELD,
					width: "30%",
				},
				///////////////////////////////////////////////////////////////////////////////
				// MANCA A DB LA COLONNA CELLULARE, EMAIL, TELEFONO, UTENTE ESTERNO
				///////////////////////////////////////////////////////////////////////////////
			],
		},
		///////////////////////////////////////////////////////////////////////////////
		// DA QUI PARTE LA SEZIONE DI ASSEGNAZIONE MODULI
		///////////////////////////////////////////////////////////////////////////////
		props.isNewUser
			? {
					title: i18next.t("data") + " " + i18next.t("company"),
					items: [
						{
							label: i18next.t("domain"),
							name: "sctIdnDbDomain",
							value: userPreferences.idnDbDomain,
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
						},
						{
							label: i18next.t("company"),
							name: "sctCodSocieta",
							value: userPreferences.codSocieta,
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
						},
						{
							label: i18next.t("company_site"),
							name: "codSede",
							value: userPreferences.codSede,
							type: TEXTFIELD,
							width: "30%",
							disabled: true,
						},
					],
			  }
			: {
					title: i18next.t("assign") + " " + i18next.t("moduls"),
					items: [
						{
							type: GRID,
							sx: { width: "45%" },
							height: 200,
							autoload: true,
							controlledFilter: filterLeftGrid,
							setControlledFilter: setFilterLeftGrid,
							gridParams: {
								findFunction: "findIwswsysdcatmoduliUser",
								orderBy: [
									{
										property: "moduleName",
										direction: "ASC",
									},
								],
								columns: [
									{
										headerName: i18next.t("id") + " " + i18next.t("moduls"),
										field: "moduleName",
									},
									{
										headerName: i18next.t("description"),
										field: "moduleTitle",
										flex: 1,
									},
									SaitRowActionDelete({
										id: "RimuoviModuloUtente",
										description: (params) => {
											return (
												"il modulo " +
												params.row.moduleName +
												", " +
												params.row.moduleTitle +
												", per l'utente " +
												params.row.uteIdUtente
											);
										},
										onConfirm: (params) => {
											let modulo = {
												moduleName: params.row.moduleName,
												uteIdUtente: params.row.uteIdUtente,
												uteSctIdnDbDomain: params.row.uteSctIdnDbDomain,
												uteSctCodSocieta: params.row.uteSctCodSocieta,
												uteCodSede: params.row.uteCodSede,
											};

											removeModuleUser(modulo);
										},
									}),
								],
							},
							filters: [
								{
									operator: EQUAL,
									name: "uteIdUtente",
									value: props.utente.idUtente,
								},
								{
									label: i18next.t("id") + " " + i18next.t("modul"),
									operator: CONTAINS,
									name: "moduleName",
									type: TEXTFIELD,
								},
								{
									label: i18next.t("description"),
									operator: CONTAINS,
									name: "moduleTitle",
									type: TEXTFIELD,
								},
							],
							inLineButtonFilter: [{}],
						},
						{
							type: GRID,
							sx: { width: "45%" },
							height: 200,
							autoload: true,
							controlledFilter: filterRightGrid,
							setControlledFilter: setFilterRightGrid,
							gridParams: {
								findFunction: "findIwswsysdcatSoloModuli",
								orderBy: [
									{
										property: "moduleName",
										direction: "ASC",
									},
								],
								columns: [
									{
										headerName: i18next.t("id") + " " + i18next.t("moduls"),
										field: "moduleName",
									},
									{
										headerName: i18next.t("description"),
										field: "moduleTitle",
										flex: 1,
									},
									SaitRowAction({
										id: "AggiungiModuloAdUtente",
										icon: <AddCircleIcon color="success" />,
										tooltip: i18next.t("add"),
										onClick: (params) => {
											let modulo = moduloUtenteBase;
											modulo.moduleName = params.row.moduleName;
											modulo.moduleTitle = params.row.moduleTitle;
											//ricordare di mettere il filtering
											/* if (
												!itemsIwswsysdcatmoduliUser.some(
													(modulo) =>
														modulo.moduleName ===
															params.row.moduleName &&
														modulo.moduleTitle ===
															params.row.moduleTitle
												)
											) {
												let moduliNonAss = [...itemsIwswsysdcatmoduliUser];
												moduliNonAss.push(params.row);
												setModuli(moduliNonAss);
											}
											addModuleToUser(params.row.moduleName); */
											addModuleToUser(modulo);
											reloadGrid();
										},
									}),
								],
							},
							filters: [
								{
									operator: STARTS_WITH,
									name: "moduleName",
									value: "N%" /* && "M0%" */,
								},
								{
									label: i18next.t("id") + " " + i18next.t("modul"),
									operator: CONTAINS,
									name: "moduleName",
									type: TEXTFIELD,
								},
								{
									label: i18next.t("description"),
									operator: CONTAINS,
									name: "moduleTitle",
									type: TEXTFIELD,
								},
								/* {
									operator: NOT_EQUAL,
									name: "moduleName",
									value: { xyz },
								}, */
							],
							inLineButtonFilter: [{}],
						},
					],
			  },
	];

	return (
		<>
			<EditWindow
				title={
					props.isNewUser
						? i18next.t("new_window_header", { object: i18next.t("user") })
						: i18next.t("edit_window_header", {
								object: i18next.t("user"),
								id: props.editSelectedRow.idUtente,
						  })
				}
				fields={fields}
				open={props.open}
				close={onClose}
				stateElement={props.isNewUser ? nuovoUtente : props.editSelectedRow}
				setFunction={props.setIsNewUser ? setNuovoUtente : props.setEditSelectedRow}
				onSave={onSave}
			></EditWindow>
		</>
	);
};

export default NuovoUtente;